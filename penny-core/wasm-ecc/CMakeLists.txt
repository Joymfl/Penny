add_executable(penny_wasm main.c)

target_include_directories(penny_wasm PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})

if(CMAKE_SYSTEM_NAME STREQUAL "WASM" OR CMAKE_SYSTEM_NAME STREQUAL "WASI")
  set_target_properties(penny_wasm PROPERTIES SUFFIX ".wasm")
endif()
