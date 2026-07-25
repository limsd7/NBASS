[Setup]
AppName=MindBodyConnect
AppVersion=26.6.6
DefaultDirName={autopf}\MindBodyConnect
DefaultGroupName=MindBodyConnect
UninstallDisplayIcon={app}\MindBodyConnect.exe
Compression=lzma2
SolidCompression=yes
OutputDir=dist-electron
OutputBaseFilename=MindBodyConnect_InnoSetup


[Files]
Source: "dist-electron\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\MindBodyConnect"; Filename: "{app}\MindBodyConnect.exe"
Name: "{autodesktop}\MindBodyConnect"; Filename: "{app}\MindBodyConnect.exe"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "Create a &desktop icon"; GroupDescription: "Additional icons:"; Flags: unchecked

[Run]
Filename: "{app}\MindBodyConnect.exe"; Description: "Launch MindBodyConnect"; Flags: nowait postinstall skipifsilent
