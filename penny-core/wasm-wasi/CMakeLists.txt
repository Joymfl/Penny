add_executable(penny_wasi main.c)

target_include_directories(penny_wasi PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})

if(CMAKE_SYSTEM_NAME STREQUAL "WASM" OR CMAKE_SYSTEM_NAME STREQUAL "WASI")
  set_target_properties(penny_wasi PROPERTIES SUFFIX ".wasm")
endif()
