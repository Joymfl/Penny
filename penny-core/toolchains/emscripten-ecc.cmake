set(CMAKE_SYSTEM_NAME WASM)
set(CMAKE_SYSTEM_PROCESSOR wasm)

set(CMAKE_EXECUTABLE_SUFFIX ".wasm")

if(NOT DEFINED ENV{EMSDK})
  message(
    FATAL_ERROR "Please source emsdk_env.sh before configuring this build")
endif()

set(EMSDK_ROOT "$ENV{EMSDK}")
set(EMSCRIPTEN_ROOT "${EMSDK_ROOT}/upstream/emscripten")

set(CMAKE_C_COMPILER "${EMSCRIPTEN_ROOT}/emcc")
set(CMAKE_LINKER "${EMSCRIPTEN_ROOT}/emcc")

set(CMAKE_LINKER "${CMAKE_C_COMPILER}")
