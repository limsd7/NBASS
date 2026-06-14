[Setup]
AppId={{5A8C9B90-D5B4-463F-A2B3-78C9E01B2C3D}
AppName=MindBodyConnect
AppVersion=26.06.06
AppPublisher=NEURO-EDULAB
AppPublisherURL=https://www.neuro-edulab.com/
AppSupportURL=https://www.neuro-edulab.com/
AppUpdatesURL=https://www.neuro-edulab.com/
DefaultDirName={autopf}\MindBodyConnect
DisableProgramGroupPage=yes
; Remove the following line to run in administrative install mode (install for all users.)
PrivilegesRequired=lowest
OutputDir=dist-installer
OutputBaseFilename=MindBodyConnect_Setup_v26.06.06
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "korean"; MessagesFile: "compiler:Languages\Korean.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "dist-electron\win-unpacked\MindBodyConnect.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "dist-electron\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{autoprograms}\MindBodyConnect"; Filename: "{app}\MindBodyConnect.exe"
Name: "{autodesktop}\MindBodyConnect"; Filename: "{app}\MindBodyConnect.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\MindBodyConnect.exe"; Description: "{cm:LaunchProgram,MindBodyConnect}"; Flags: nowait postinstall skipifsilent
