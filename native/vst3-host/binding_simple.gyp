{
  "targets": [
    {
      "target_name": "vst3_host_simple",
      "sources": [
        "src/vst3_host_simple.cpp"
      ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")",
        "include",
        "../../third_party/vst3sdk",
        "../../third_party/vst3sdk/base",
        "../../third_party/vst3sdk/pluginterfaces",
        "../../third_party/vst3sdk/public.sdk",
        "../../third_party/vst3sdk/public.sdk/source/vst",
        "../../third_party/asio/common"
      ],
      "defines": [
        "NOMINMAX",
        "WIN32_LEAN_AND_MEAN",
        "DEVELOPMENT=1"
      ],
      "conditions": [
        ["OS=='win'", {
          "defines": [
            "UNICODE",
            "_UNICODE"
          ],
          "libraries": [
            "-lole32",
            "-loleaut32",
            "-luuid",
            "-ladvapi32",
            "-lshell32",
            "-luser32",
            "-lkernel32",
            "-lgdi32",
            "-lwinspool",
            "-lcomdlg32",
            "-lcomctl32"
          ],
          "msvs_settings": {
            "VCCLCompilerTool": {
              "ExceptionHandling": 1,
              "RuntimeTypeInfo": "true",
              "AdditionalOptions": ["/std:c++20"]
            }
          }
        }],
        ["OS=='mac'", {
          "xcode_settings": {
            "CLANG_CXX_LANGUAGE_STANDARD": "c++20",
            "CLANG_CXX_LIBRARY": "libc++",
            "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
            "GCC_ENABLE_CPP_RTTI": "YES"
          },
          "link_settings": {
            "libraries": [
              "-framework AudioUnit",
              "-framework AudioToolbox",
              "-framework Carbon",
              "-framework Cocoa",
              "-framework CoreAudio",
              "-framework CoreMIDI"
            ]
          }
        }],
        ["OS=='linux'", {
          "cflags_cc": [
            "-std=c++20",
            "-fexceptions",
            "-frtti"
          ],
          "link_settings": {
            "libraries": [
              "-lasound",
              "-ljack",
              "-lpthread",
              "-ldl"
            ]
          }
        }]
      ]
    }
  ]
}
