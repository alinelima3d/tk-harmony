/*
  Function: TB_sceneOpenPreUI_Offline
  Description: function executes when opening an existing offline scene before the UI (views, layouts) have
               been created and loaded.
  Note: This script is also executed when opening a template for editing.
 */ 
include( "TB_RelinkPaths.js" )
 
function TB_sceneOpenPreUI_Offline(){
	// if(!firstOpen()){
		
	// 	MessageLog.trace("Scene Opened: " + scene.currentProjectPath());
	// 	return;
	// }

	// var assetName = System.getenv('ASSET_NAME');
	// var scenePath = System.getenv('SCENE_PATH');

	// if(!sceneExists(scenePath)){
	// scene.saveAs(scenePath);
	// scene.saveAsNewVersion(assetName + ".v001", true);
	// } else {
	// var tbPath = specialFolders.bin + "/HarmonyPremium.exe";
	// var lastVersion = getLastSceneVersion(scenePath);
	// 	if(!lastVersion){
	// 	MessageBox.information("Nao e uma cena de toon boom!\n" + scenePath);
	// 	return;
	// }
			
	// var start = Process2(tbPath, lastVersion);
	// start.launchAndDetach();
	// scene.closeSceneAndExit();
	// return;
	// }
	
	// var textLog = scenePath + "/_scene.log";

	// writeLog(textLog);

	// TB_RelinkPathsInteractive();

	// var assetNode = "Top/bdb_startup";
	// var columnId = node.linkedColumn(assetNode,"DRAWING.ELEMENT");
	// var elementKey = column.getElementIdOfDrawing(columnId);
	// node.rename(assetNode, assetName);
	// column.rename(columnId, assetName);
	// element.renameById(elementKey, assetName);
	// var exportNode = "Top/SETUP/EXPORT";
	// var exportPath = "frames/" + assetName;
	// node.setTextAttr(exportNode, "DRAWING_NAME", 0, exportPath);
	// var paletPath = scenePath + "/palette-library/" + assetName;
	// var paletteList = PaletteObjectManager.getScenePaletteList();
	// var paleta = paletteList.addPalette(paletPath);
	// var numCor = paleta.nColors;
	// 	for(var i=numCor-1; i>0; i--){
	// 	var cor = paleta.getColorByIndex(i);
	// 		if(cor.name != "Black"){
	// 		paleta.removeColor(cor.id);
	// 		}
	// 	}
	
	// scene.saveAll();
	// scene.clearHistory();
	
	// //////////////Helper Functions////////
	// function firstOpen(){//funcao que checa se o arquivo esta sendo aberto pela primeira vez
	// 	MessageLog.trace("firstOpen " );
	// 	var sceneLog = new File(scene.currentProjectPath() + "/_scene.log");
	// 	MessageLog.trace(!sceneLog.exists );
	// 	return !sceneLog.exists;
	// }
	
	// function sceneExists(path){//checa se a pasta existe
	// var dir = new Dir;
	// dir.path = path;
	// return dir.exists;
	// }
	
	// function getLastSceneVersion(scenePath){//pega a ultima versao da cena e retorna o caminho inteiro
	// var myDir = new Dir();
	// myDir.path = scenePath;
	// var fileList = myDir.entryList("*.xstage",2,1);
	// 	if(fileList == ""){
	// 	MessageLog.trace("Versão mais recente não encontrada! Verifique se o arquivo dado é um arquivo de Toon Boom!");
	// 	return false;
	// 	}
	// return myDir.filePath(fileList[0]);
	// }
	
	// function writeLog(txtName){//cria um log com as infos sobre o envio
	// var file = new File(txtName);
	// 	if(!file.exists){
	// 	file.open(FileAccess.WriteOnly);
	// 	file.writeLine("---------------------------Scene Created---------------------------------" + "\r");
	// 	file.writeLine("user: " + about.getUserName() + "\r");	
	// 	file.writeLine("time created: " + new Date() + "\r");
	// 	file.close();
	// 	MessageLog.trace("O arquivo '" + txtName + "' foi criado com sucesso!" );
	// 	return true;
	// 	} else { 
	// 	return false;
	// 	}
	// }
	
}

function TB_sceneOpenPreUI_Online(){
}


	