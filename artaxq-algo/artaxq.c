
#include "artaxq.h"
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <stdio.h>
#include "sph_keccak.h"
#include "sph_echo.h"

void artaxq_hash(const char* input, char* output)
{
 	
 	sph_keccak512_context ctx_keccak;
 	sph_echo512_context ctx_echo;

	uint8_t hash[64]; 
 
 	sph_keccak512_init(&ctx_keccak);
 	sph_keccak512(&ctx_keccak, (const void*) hash, 64);
 	sph_keccak512_close(&ctx_keccak, (void*) hash);
 
 	sph_echo512_init(&ctx_echo);
 	sph_echo512(&ctx_echo, (const void*) hash, 64);
 	sph_echo512_close(&ctx_echo, (void*) hash);
 
 	memcpy(output, hash, 32);
}
