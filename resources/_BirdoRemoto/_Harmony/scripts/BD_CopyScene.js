/*
-------------------------------------------------------------------------------
Name:		BD_CopyScene.js

Description:	Este script coia a cena atual para a pasta fornecida como parametro levando apenas os elementos da ultima versao;

Usage:		Usado para chamar em outros scripts com o Include();

Author:		Leonardo Bazilio Bentolila

Created:	Maio, 2020.
            
Copyright:   leobazao_@Birdo
 
-------------------------------------------------------------------------------
*/

function BD_CopyScene(destinationPath, pgBar){
var currPath = scene.currentProjectPath();

var fails = [];

var listaDeExecoes =  listaSujeira(currPath);
var listToCopy = filesToCopy(currPath, listaDeExecoes);

makeDir(destinationPath);

pgBar.ui.groupBox.progressBar2.setRange(0, listToCopy.length);

	for(var i=0; i<listToCopy.length; i++){
	var original = currPath + "/" + listToCopy[i];
	var copia = destinationPath + "/" + listToCopy[i];
	pgBar.ui.groupBox.label2.setText("Copying File..." + listToCopy[i]);
	pgBar.ui.groupBox.progressBar2.setValue(i+1);
		if(fileOrFolder(original) == "FOLDER"){
		makeDir(copia);
		}
		if(fileOrFolder(original) == "FILE"){
			if(!copyFile(original, copia)){
			fails.push(original);
			}
		}
	}
pgBar.ui.groupBox.progressBar2.reset();
return fails;
}

////////////////////funcoes extras/////////////////////////
	function listaSujeira(cenaPath){//Lista todos arquivos nao usados na versao para nao ir com a cena
	var currVersion = scene.currentVersionName();
	var dir = new Dir;
	dir.path = cenaPath;
	var listSujeira = [];
	var fileList = dir.entryList("*", 2, 4);
		for(var i=0; i<fileList.length; i++){
			if(fileList[i].slice(-4) == "lock" || fileList[i] == "_lockRender.log"){
			listSujeira.push(fileList[i]);
			continue;
			}
			if(fileList[i].indexOf(".aux") != -1 || fileList[i].indexOf(".xstage") != -1){
				if(fileList[i].indexOf(currVersion + ".") == -1){
				listSujeira.push(dir.path + "/" + fileList[i]);
				}
			}
		}
	return listUnusedElements(listSujeira);
	}

	function listUnusedElements(lista){//lista todos elementos nao usados na versao atual
	var usedElements = listUsedElements();
		for(var i=0; i<element.numberOf(); i++){
		var ElementId = element.id(i);
		var folder = element.completeFolder(ElementId);
			if(usedElements.indexOf(folder) == -1){
			lista.push(folder);
			}
		}
	return lista;
		function listUsedElements(){//Lista o caminho de todos elementos usados na versao da cena
		var listUsedElem = [];
		var readList = node.getNodes(["READ"]); 
			for(var i=0; i<readList.length; i++){
			var ElementId = node.getElementId(readList[i]);
			var folder = element.completeFolder(ElementId);
			listUsedElem.push(folder);
			}
		return listUsedElem;	
		}
	}

	function filesToCopy(scenePath, execoes){//Lista tudo para ser enviado (exeto a lista de execao ) - path depois da origem
	var folderList = [];
	var filesList = [];
	loopCount(scenePath);

		function loopCount(path){
		var dir = new Dir;
		dir.path = path;
		var list = dir.entryList("*",3,4);
			for(var i=2;i<list.length;i++){//começa no 2 para ignorar os dois primeiros itens “.” e “..”
			var fullPath = dir.filePath(list[i]);
				if(execoes.indexOf(fullPath) != -1){
				continue;
				}
			var item = fullPath.replace(scenePath + "/", "");//deixa somente o caminho depois do path inicial
				if(list[i] == "frames"){
				folderList.push(item);
				continue;
				}
				if(fileOrFolder(fullPath) == "FILE"){
				filesList.push(item);
				} else if(fileOrFolder(fullPath) == "FOLDER"){
				folderList.push(item);
				loopCount(fullPath);
				}
			}
		}
	return folderList.concat(filesList);//junta array folders e files (primeiro folders)
	}

	function copyFile(copyPath, pastePath){//Copia um Arquivo para o caminho dado
	var fileToCopy = new PermanentFile(copyPath);
	var copyOfFile = new PermanentFile(pastePath);
	var copy = fileToCopy.copy(copyOfFile);
		if(!copy){
		MessageLog.trace("Fail to copy the file: '" + copyPath + "'!");
		} else { 
		MessageLog.trace("File: '" + pastePath + "' Copied!");
		}
	return copy;
	}

	function fileOrFolder(fileToCheck){//retorna se o caminho é para um FILE ou FOLDER
	var tempFile = new QFileInfo(fileToCheck);
		if(!tempFile.isFile()){
		return "FOLDER";
		}else{
		return "FILE";
		}
	}

	function makeDir(dirPath){//cria diretorio recusivamente
	var myDir = new Dir;
	myDir.path = dirPath;
		if(!myDir.exists){
		myDir.mkdirs(dirPath);
		MessageLog.trace("Diretorio : " + dirPath + " Criado com sucesso!");
		return true;
		}
	return false;
	}
	
	function dirExist(path){//checa se a pasta existe
	var dir = new Dir;
	dir.path = path;
	return dir.exists;
	}

/////////////////////////////////
