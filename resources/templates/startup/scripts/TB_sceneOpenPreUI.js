/*
  Function: TB_sceneOpenPreUI_Offline
  Description: function executes when opening an existing offline scene before the UI (views, layouts) have
               been created and loaded.
  Note: This script is also executed when opening a template for editing.
 */ 
include( "TB_RelinkPaths.js" )
 
function TB_sceneOpenPreUI_Offline(){
	// executa esse script toda vez que abre essa cena
	// ou quando usa ela como template para criacao de uma nova cena
	MessageLog.trace("aline: pre first open");
	if(!firstOpen()){
		MessageLog.trace("aline: Scene Opene");
		MessageLog.trace("Scene Opened: " + scene.currentProjectPath());
		return;
	}
	MessageLog.trace("aline: pos if");

	MessageLog.trace("aline: 1");
	var assetName = System.getenv('ASSET_NAME');
	var scenePath = System.getenv('SCENE_PATH');

	MessageLog.trace("aline: 2" + assetName);
	MessageLog.trace("aline: 3" + scenePath);

	if(!sceneExists(scenePath)){
		MessageLog.trace("aline: cena nao existe, salvar");
		// se cena nao existe, salvar como scenes
		scene.saveAs(scenePath);
		// e salvar uma nova versao para salvar com nome certo
		scene.saveAsNewVersion(assetName + ".v001", true);
	} else {
		// se a cena ja existe, abrir
		MessageLog.trace("aline: cena existe, abrir");
		var tbPath = specialFolders.bin + "/HarmonyPremium.exe";
		var lastVersion = getLastSceneVersion(scenePath);
		MessageLog.trace("aline: lastVersion" + lastVersion);
		if(!lastVersion){
			MessageBox.information("Nao e uma cena de toon boom!\n" + scenePath);
		return;
	}
	
	// abrir leo
	// MessageLog.trace("aline: comecar o processo de abrir");
	// var start = Process2(tbPath, lastVersion);
	// MessageLog.trace("aline: comecar o processo de abrir 2");
	// start.launchAndDetach();
	// MessageLog.trace("aline: comecar o processo de abrir 3");
	// scene.closeSceneAndExit();
	// MessageLog.trace("aline: comecar o processo de abrir 4");

	if (typeof(app.shotgun) === "undefined")
		app.shotgun = {};

	MessageLog.trace('-------------------------');
	MessageLog.trace('Shotgun startup started');
	MessageLog.trace('-------------------------');

	var python_exec = System.getenv('SGTK_HARMONY_ENGINE_PYTHON');
	var boostrap_py = System.getenv('SGTK_HARMONY_ENGINE_STARTUP');
	var engine_name = 'tk-harmony';
	var engine_port = System.getenv('SGTK_HARMONY_ENGINE_PORT');
	var app_id = 'basic.*`';
	MessageLog.trace('Initializing Shotgun Harmony engine ...');
	MessageLog.trace('   engine name: ' + engine_name);
	MessageLog.trace('   engine port: ' + engine_port );
	MessageLog.trace('   engine app id: ' + app_id);
	MessageLog.trace('   engine python: ' + python_exec);
	MessageLog.trace('   engine bootstrap: ' + boostrap_py);

	var engine_process = new Process2(python_exec, boostrap_py,  engine_port, engine_name, app_id);  
	MessageLog.trace('About to execute: ');
	MessageLog.trace(engine_process.commandLine());

	var error = engine_process.launchAndDetach();
	MessageLog.trace('error ' + error );

	app.shotgun.window = null;
	app.shotgun.engine_name = engine_name;

	app.shotgun.engine_process = engine_process;
	app.shotgun.engine_pid = engine_process.pid();

	app.shotgun.engine_host = "localhost";
	app.shotgun.engine_port = parseInt(engine_port);

	app.shotgun.debug = true;

	MessageLog.trace("Registered onAboutToQuit callback: " + app.aboutToQuit);
	app.aboutToQuit.connect(app, app.shotgun.engine_process.terminate);

	app.__SGTK_STARTUP_INIT__ = true;

	return;
	}
	
	var textLog = scenePath + "/_scene.log";

	writeLog(textLog);

	TB_RelinkPathsInteractive();

	var assetNode = "Top/bdb_startup";
	var columnId = node.linkedColumn(assetNode,"DRAWING.ELEMENT");
	var elementKey = column.getElementIdOfDrawing(columnId);
	node.rename(assetNode, assetName);
	column.rename(columnId, assetName);
	element.renameById(elementKey, assetName);
	var exportNode = "Top/SETUP/EXPORT";
	var exportPath = "frames/" + assetName;
	node.setTextAttr(exportNode, "DRAWING_NAME", 0, exportPath);
	var paletPath = scenePath + "/palette-library/" + assetName;
	var paletteList = PaletteObjectManager.getScenePaletteList();
	var paleta = paletteList.addPalette(paletPath);
	var numCor = paleta.nColors;
		for(var i=numCor-1; i>0; i--){
		var cor = paleta.getColorByIndex(i);
			if(cor.name != "Black"){
			paleta.removeColor(cor.id);
			}
		}
	
	scene.saveAll();
	scene.clearHistory();
	
	//////////////Helper Functions////////
	function firstOpen(){//funcao que checa se o arquivo esta sendo aberto pela primeira vez
		// ver se existe o arquivo scene.log existe, 
		// se existir quer dizer que nao eh a primeira vez que abre
		// se nao existir, quer dizer que eh a primeira vez, que esta abrindo como template
		MessageLog.trace("aline: firstOpen" );
		var sceneLog = new File(scene.currentProjectPath() + "/_scene.log");
		MessageLog.trace(!sceneLog.exists );
		MessageLog.trace("aline: firstOpen" + !sceneLog.exists );
		return !sceneLog.exists;
	}
	
	function sceneExists(path){//checa se a pasta existe
	var dir = new Dir;
	dir.path = path;
	return dir.exists;
	}
	
	function getLastSceneVersion(scenePath){//pega a ultima versao da cena e retorna o caminho inteiro
	var myDir = new Dir();
	myDir.path = scenePath;
	var fileList = myDir.entryList("*.xstage",2,1);
		if(fileList == ""){
		MessageLog.trace("Versão mais recente não encontrada! Verifique se o arquivo dado é um arquivo de Toon Boom!");
		return false;
		}
	return myDir.filePath(fileList[0]);
	}
	
	function writeLog(txtName){//cria um log com as infos sobre o envio
	var file = new File(txtName);
		if(!file.exists){
		file.open(FileAccess.WriteOnly);
		file.writeLine("---------------------------Scene Created---------------------------------" + "\r");
		file.writeLine("user: " + about.getUserName() + "\r");	
		file.writeLine("time created: " + new Date() + "\r");
		file.close();
		MessageLog.trace("O arquivo '" + txtName + "' foi criado com sucesso!" );
		return true;
		} else { 
		return false;
		}
	}
	
}

function TB_sceneOpenPreUI_Online(){
}


	