; Minimal Inno Setup Script
[Setup]
AppId={{com.mindbodyconnect.app}}
AppName=MindBodyConnect
AppVersion=0.0.0
DefaultDirName={autopf}\MindBodyConnect
DefaultGroupName=MindBodyConnect
OutputDir=.
OutputBaseFilename=MindBodyConnect_Setup
Compression=lzma
SolidCompression=yes

[Files]
; IMPORTANT: You must run 'npx electron-builder --dir' before compiling this script.
Source: "c:\SN1\dist-electron\win-unpacked\MindBodyConnect.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "c:\SN1\dist-electron\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\MindBodyConnect"; Filename: "{app}\MindBodyConnect.exe"
Name: "{autodesktop}\MindBodyConnect"; Filename: "{app}\MindBodyConnect.exe"

[Run]
Filename: "{app}\MindBodyConnect.exe"; Description: "Launch MindBodyConnect"; Flags: nowait postinstall skipfsnotify
