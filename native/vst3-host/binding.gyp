{
  "targets": [
    {
      "target_name": "vst3_host",
      "sources": [
        "src/simple_vst3_host.cpp"
      ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")"
      ],
      "defines": [
        "NOMINMAX",
        "WIN32_LEAN_AND_MEAN",
        "UNICODE",
        "_UNICODE"
      ],
      "conditions": [
        ["OS=='win'", {
          "libraries": [
            "-lole32",
            "-loleaut32",
            "-luuid",
            "-luser32",
            "-lkernel32",
            "-lgdi32"
          ],
          "msvs_settings": {
            "VCCLCompilerTool": {
              "ExceptionHandling": 1,
              "RuntimeTypeInfo": "true",
              "RuntimeLibrary": 2,
              "AdditionalOptions": ["/std:c++20"]
            }
          }
        }]
      ]
    }
  ]
}
