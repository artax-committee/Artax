// Copyright (c) 2011-2018 The Bitcoin Core developers
// Distributed under the MIT software license, see the accompanying
// file COPYING or http://www.opensource.org/licenses/mit-license.php.

#include <qt/receiverequestdialog.h>
#include <qt/forms/ui_receiverequestdialog.h>

#include <qt/bitcoinunits.h>
#include <qt/guiconstants.h>
#include <qt/guiutil.h>
#include <qt/optionsmodel.h>
#include <qt/styleSheet.h>

#include <QClipboard>
#include <QDrag>
#include <QMenu>
#include <QMimeData>
#include <QMouseEvent>
#include <QPixmap>

#if defined(HAVE_CONFIG_H)
#include <config/bitcoin-config.h> /* for USE_XRCODE */
#endif

#ifdef USE_XRCODE
#include <qrencode.h>
#endif

QRImageWidget::QRImageWidget(QWidget *parent):
    QLabel(parent), contextMenu(0)
{
    contextMenu = new QMenu(this);
    QAction *saveImageAction = new QAction(tr("&Save Image..."), this);
    connect(saveImageAction, SIGNAL(triggered()), this, SLOT(saveImage()));
    contextMenu->addAction(saveImageAction);
    QAction *copyImageAction = new QAction(tr("&Copy Image"), this);
    connect(copyImageAction, SIGNAL(triggered()), this, SLOT(copyImage()));
    contextMenu->addAction(copyImageAction);
}

QImage QRImageWidget::exportImage()
{
    if(!pixmap())
        return QImage();
    return pixmap()->toImage();
}

void QRImageWidget::mousePressEvent(QMouseEvent *event)
{
    if(event->button() == Qt::LeftButton && pixmap())
    {
        event->accept();
        QMimeData *mimeData = new QMimeData;
        mimeData->setImageData(exportImage());

        QDrag *drag = new QDrag(this);
        drag->setMimeData(mimeData);
        drag->exec();
    } else {
        QLabel::mousePressEvent(event);
    }
}

void QRImageWidget::saveImage()
{
    if(!pixmap())
        return;
    QString fn = GUIUtil::getSaveFileName(this, tr("Save QR Code"), QString(), tr("PNG Image (*.png)"), nullptr);
    if (!fn.isEmpty())
    {
        exportImage().save(fn);
    }
}

void QRImageWidget::copyImage()
{
    if(!pixmap())
        return;
    QApplication::clipboard()->setImage(exportImage());
}

void QRImageWidget::contextMenuEvent(QContextMenuEvent *event)
{
    if(!pixmap())
        return;
    contextMenu->exec(event->globalPos());
}

ReceiveRequestDialog::ReceiveRequestDialog(QWidget *parent) :
    QDialog(parent),
    ui(new Ui::ReceiveRequestDialog),
    model(0)
{
    ui->setupUi(this);

    SetObjectStyleSheet(ui->btnCopyURI, StyleSheetNames::ButtonWhite);
    SetObjectStyleSheet(ui->btnSaveAs, StyleSheetNames::ButtonWhite);
    SetObjectStyleSheet(ui->btnCopyAddress, StyleSheetNames::ButtonWhite);

#ifndef USE_XRCODE
    ui->btnSaveAs->setVisible(false);
    ui->lblXRCode->setVisible(false);
#endif

    connect(ui->btnSaveAs, SIGNAL(clicked()), ui->lblXRCode, SLOT(saveImage()));
}

ReceiveRequestDialog::~ReceiveRequestDialog()
{
    delete ui;
}

void ReceiveRequestDialog::setModel(WalletModel *_model)
{
    this->model = _model;

    if (_model)
        connect(_model->getOptionsModel(), SIGNAL(displayUnitChanged(int)), this, SLOT(update()));

    // update the display unit if necessary
    update();
}

void ReceiveRequestDialog::setInfo(const SendCoinsRecipient &_info)
{
    this->info = _info;
    update();
}

bool ReceiveRequestDialog::createXRCode(QLabel *label, SendCoinsRecipient _info, bool showAddress)
{
#ifdef USE_XRCODE
    QString uri = GUIUtil::formatBitcoinURI(_info);
    label->setText("");
    if(!uri.isEmpty())
    {
        // limit URI length
        if (uri.length() > MAX_URI_LENGTH)
        {
            label->setText(tr("Resulting URI too long, try to reduce the text for label / message."));
        } else {
            QRcode *code = QRcode_encodeString(uri.toUtf8().constData(), 0, QR_ECLEVEL_L, QR_MODE_8, 1);
            if (!code)
            {
                label->setText(tr("Error encoding URI into QR Code."));
                return false;
            }
            QImage qrImage = QImage(code->width + 8, code->width + 8, QImage::Format_ARGB32);
            qrImage.fill(qRgba(0, 0, 0, 0));
            unsigned char *p = code->data;
            for (int y = 0; y < code->width; y++)
            {
                for (int x = 0; x < code->width; x++)
                {
                    qrImage.setPixel(x + 4, y + 4, ((*p & 1) ? qRgba(0, 0, 0, 255) : qRgba(255, 255, 255, 255)));
                    p++;
                }
            }
            QRcode_free(code);

            QImage qrAddrImage = QImage(QR_IMAGE_SIZE, QR_IMAGE_SIZE+20, QImage::Format_ARGB32);
            qrAddrImage.fill(qRgba(0, 0, 0, 0));
            QPainter painter(&qrAddrImage);
            painter.drawImage(0, 0, qrImage.scaled(QR_IMAGE_SIZE, QR_IMAGE_SIZE));

            if(showAddress)
            {
                QFont font = GUIUtil::fixedPitchFont();
                QRect paddedRect = qrAddrImage.rect();

                // calculate ideal font size
                qreal font_size = GUIUtil::calculateIdealFontSize(paddedRect.width() - 20, _info.address, font);
                font.setPointSizeF(font_size);

                painter.setFont(font);
                paddedRect.setHeight(QR_IMAGE_SIZE+12);
                painter.drawText(paddedRect, Qt::AlignBottom|Qt::AlignCenter, _info.address);
                painter.end();
            }

            label->setPixmap(QPixmap::fromImage(qrAddrImage));
            return true;
        }
    }
#else
    Q_UNUSED(label);
    Q_UNUSED(_info);
#endif
    return false;
}

void ReceiveRequestDialog::update()
{
    if(!model)
        return;
    QString target = info.label;
    if(target.isEmpty())
        target = info.address;
    setWindowTitle(tr("Request payment to %1").arg(target));

    QString uri = GUIUtil::formatBitcoinURI(info);
    ui->btnSaveAs->setEnabled(false);
    QString html;
    html += "<html><font face='verdana, arial, helvetica, sans-serif'>";
    html += "<font color='#ffffff'>" + tr("PAYMENT INFORMATION")+"</font><br><br>";
    html += tr("URI")+": ";
    html += "<a href=\""+uri+"\">" + GUIUtil::HtmlEscape(uri) + "</a><br>";
    html += tr("Address")+": <font color='#ffffff'>" + GUIUtil::HtmlEscape(info.address) + "</font><br>";
    if(info.amount)
        html += tr("Amount")+": <font color='#ffffff'>" + BitcoinUnits::formatHtmlWithUnit(model->getOptionsModel()->getDisplayUnit(), info.amount) + "</font><br>";
    if(!info.label.isEmpty())
        html += tr("Label")+": <font color='#ffffff'>" + GUIUtil::HtmlEscape(info.label) + "</font><br>";
    if(!info.message.isEmpty())
        html += tr("Message")+": <font color='#ffffff'>" + GUIUtil::HtmlEscape(info.message) + "</font><br>";
    if(model->isMultiwallet()) {
        html += tr("Wallet")+": <font color='#ffffff'>" + GUIUtil::HtmlEscape(model->getWalletName()) + "</font><br>";
    }
    ui->outUri->setText(html);

#ifdef USE_XRCODE
    if(createXRCode(ui->lblXRCode, info))
    {
        ui->lblXRCode->setScaledContents(true);
        ui->btnSaveAs->setEnabled(true);
    }
#endif
}

void ReceiveRequestDialog::on_btnCopyURI_clicked()
{
    GUIUtil::setClipboard(GUIUtil::formatBitcoinURI(info));
}

void ReceiveRequestDialog::on_btnCopyAddress_clicked()
{
    GUIUtil::setClipboard(info.address);
}
