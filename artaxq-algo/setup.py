from distutils.core import setup, Extension

artaxq_hash_module = Extension('artaxq_hash',
                               sources = ['artaxqmodule.c',
                                          'artaxq.c',
										  'sph/aes_helper.c',
										  'sph/sph_keccak.c',
										  'sph/sph_echo.c'],
                               include_dirs=['.', './sph'])

setup (name = 'artaxq_hash',
       version = '1.0',
       description = 'Bindings for artaxq proof of work used by Artax',
       ext_modules = [artaxq_hash_module])
