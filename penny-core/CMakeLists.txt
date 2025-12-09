cmake_minimum_required(VERSION 3.25)
project(penny_core_multi C)

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

option(BUILD_NATIVE "Build native target" ON)
option(BUILD_WASM_ECC "Build WASM (Emscripten ECC) target" ON)
option(BUILD_WASM_WASI "Build WASM (WASI SDK) target" ON)

if(BUILD_NATIVE)
  add_subdirectory(native)
endif()

if(BUILD_WASM_ECC)
  add_subdirectory(wasm-ecc)
endif()

if(BUILD_WASM_WASI)
  add_subdirectory(wasm-wasi)
endif()

# add_custom_target(link_compile_commands ALL COMMAND ${CMAKE_COMMAND}) -E
# create_symlink ${CMAKE_BINARY_DIR}/compile_commands.json
# ${CMAKE_SOURCE_DIR}/compile_commands.json COMMENT "Symlinking
# compile_commands.json -> project root" )
