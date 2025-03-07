[Setup]
AppName=Monitoring Agent
SetupIconFile=icon1.ico
AppVersion=1.0
DefaultDirName={pf}\MonitoringAgent
DefaultGroupName=MonitoringAgent
OutputDir=.
OutputBaseFilename=MonitoringAgentSetup
Compression=lzma
SolidCompression=yes
ArchitecturesInstallIn64BitMode=x64

[Languages]
Name: "french"; MessagesFile: "compiler:Languages\French.isl"

[Files]
Source: "main.py"; DestDir: "{app}"
Source: "agent_config.json"; DestDir: "{app}"
Source: "start.bat"; DestDir: "{app}"
Source: "icon1.ico"; DestDir: "{app}"

[Icons]
Name: "{group}\Monitoring Agent"; Filename: "{app}\main.py"; IconFilename: "{app}\icon1.ico"

[Registry]
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "MonitoringAgent"; ValueData: "{app}\start.bat"; Flags: uninsdeletevalue

[Code]
var
  ServerIP: string;
  PythonPath: string;
  ErrorCode: Integer; // Déclaration de la variable ErrorCode

procedure InstallDependencies;
begin
  Exec(PythonPath, '-m pip install websocket-client psutil uuid', '', SW_HIDE, ewWaitUntilTerminated, ErrorCode);
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssInstall then begin
    InstallDependencies;
  end;
end;