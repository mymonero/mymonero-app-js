!macro customInstall
  DetailPrint "Register monero URI Handler"
  DeleteRegKey HKCR "monero"
  WriteRegStr HKCR "monero" "" "URL:monero"
  WriteRegStr HKCR "monero" "URL Protocol" ""
  WriteRegStr HKCR "monero\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  WriteRegStr HKCR "monero\shell" "" ""
  WriteRegStr HKCR "monero\shell\Open" "" ""
  WriteRegStr HKCR "monero\shell\Open\command" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME} %1"
!macroend