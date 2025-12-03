cmake_minimum_required(VERSION 3.20)

# Make CMake treat this project as a WASI/WASM build, not Windows.
set(CMAKE_SYSTEM_NAME WASI)
set(CMAKE_SYSTEM_PROCESSOR wasm32)
set(CMAKE_TRY_COMPILE_TARGET_TYPE STATIC_LIBRARY)

project(penny_wasm_core C)

# Disable MSVC/Windows flags
set(CMAKE_C_FLAGS_INIT "")
set(CMAKE_C_FLAGS_DEBUG "")
set(CMAKE_C_FLAGS_RELEASE "")

# WASI paths
set(WASI_SYSROOT "C:/wasi-sdk/share/wasi-sysroot")
set(CMAKE_C_COMPILER "C:/wasi-sdk/bin/clang.exe")

# WASM compile flags
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} \
    --target=wasm32-wasi \
    --sysroot=${WASI_SYSROOT} \
    -O3 \
")

# Build wasm as MODULE library, not executable
add_executable(penny_core
    src/scheduler.c
    src/deque.c
    src/memory.c
)

# Output as .wasm
set_target_properties(penny_core PROPERTIES
    PREFIX ""
    SUFFIX ".wasm"
    LIBRARY_OUTPUT_DIRECTORY ${CMAKE_SOURCE_DIR}/out
)

add_executable(test_wasm src/test.c)

set_target_properties(test_wasm PROPERTIES
OUTPUT_NAME "test"
SUFFIX ".wasm")

target_link_options(test_wasm PRIVATE)
