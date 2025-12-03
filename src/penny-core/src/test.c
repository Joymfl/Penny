//
// Created by joydm on 03-12-2025.
//


#include <stdio.h>

int add(int a, int b) {
  return a + b;
}

int main(void) {
  printf("Hello from WASM! add(12, 30) = %d\n", add(12,30));
  return 0;
}