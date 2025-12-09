set(CMAKE_SYSTEM_NAME WASI)

set(WASI_SDK_PREFIX "/opt/wasi-sdk")

set(CMAKE_SYSROOT "${WASI_SDK_PREFIX}/share/wasi-sysroot")

set(CMAKE_C_COMPILER "${WASI_SDK_PREFIX}/bin/clang")
