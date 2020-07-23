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
	var scenePath = System.getenv('SCENE_PATH') + assetName;

	MessageLog.trace("aline: 2" + assetName);
	MessageLog.trace("aline: 3");

	if(!sceneExists(scenePath)){
		MessageLog.trace("aline: cena nao existe, salvar");
		// se cena nao existe, salvar como scenes
		scene.saveAs(scenePath);
		
		// e salvar uma nova versao para salvar com nome certo
		scene.saveAsNewVersion(assetName + ".v001", true);
		MessageLog.trace("aline: antes de excluir" + scenePath + ".xstage");
		rmFile(scenePath + assetName + ".xstage")
		MessageLog.trace("aline: depois de excluido" + scenePath + ".xstage");
		return;
	} else {
		// se a cena ja existe, abrir
		MessageLog.trace("aline: cena existe, abrir");
		var tbPath = specialFolders.bin + "/HarmonyPremium.exe";
		var lastVersion = getLastSceneVersion(scenePath);
		MessageLog.trace("aline: lastVersion" + lastVersion);
		if(!lastVersion){
			MessageLog.trace("aline: if lastVersion" + lastVersion);
			MessageBox.information("Nao e uma cena de toon boom!\n" + scenePath);
			return;
		} else {
			MessageLog.trace("aline: else1" + lastVersion);
			window = QApplication.activeWindow();
			MessageLog.trace("aline: else2" + lastVersion);
			window.requestOpenScene(scenePath);
			MessageLog.trace("aline: else3" + lastVersion);
			return;
		}
	
	// abrir 
	// MessageLog.trace("aline: comecar o processo de abrir");
	// var start = Process2(tbPath, lastVersion);
	// MessageLog.trace("aline: comecar o processo de abrir 2");
	// start.launchAndDetach();
	// MessageLog.trace("aline: comecar o processo de abrir 3");
	// scene.closeSceneAndExit();
	// MessageLog.trace("aline: comecar o processo de abrir 4");

		

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
		MessageLog.trace("aline: getLastSceneVersion" + scenePath );
		var myDir = new Dir();
		myDir.path = scenePath;
		var fileList = myDir.entryList("*.xstage",2,1);
		MessageLog.trace("aline: fileList" + fileList );
		MessageLog.trace("aline: fileList" + fileList.length );
		if(fileList == ""){
			MessageLog.trace("Versão mais recente não encontrada! Verifique se o arquivo dado é um arquivo de Toon Boom!");
			return false;
		}
		var i;
		for (i = 0; i < fileList.length; i++) {
			MessageLog.trace("aline: fileList" + fileList[i] );
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

	function rmFile(fn) {
		var v = new PermanentFile(fn);
		 v.remove();
	 } 
	
}

function TB_sceneOpenPreUI_Online(){
}


	