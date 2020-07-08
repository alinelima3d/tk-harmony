  /*
-------------------------------------------------------------------------------
Name:		BD_RemoveUnusedElements.js

Description:	Este Script deleta as pastas dos elementos nao usados na Versao da cena

Usage:		usado para diminuir o tamanho do arquivo! Deletando os elementos nao usados na pasta elements

Author:		Leonardo Bazilio Bentolila

Created:	Maio, 2020;
            
Copyright:   leobazao_@Birdo
-------------------------------------------------------------------------------
*/
function BD_RemoveUnusedElements(){

	if(scene.currentVersion() > 1){//verifica se existe mais de uma versao
	var escolha = MessageBox.information("Este arquivo contem mais de uma versao! Esta acao podera afetar as outras versoes.\nDeseja continuar??", 3,4);
		if(escolha == 4){
		return;
		}
	}

var listToDelete = listToDeleteFolders();
var deletedCounter = 0;
var progressDlg; 
progressDlg = new QProgressDialog();
progressDlg.modal = true;
progressDlg.open();
progressDlg.setCancelButton(0);
progressDlg.setRange(0, listToDelete.length);

	for(var i=0; i<listToDelete.length; i++){
	progressDlg.setValue(i+1);	
	progressDlg.setLabelText("Deleting Element...\n..." + listToDelete[i].slice(-15));
		if(removeDir(listToDelete[i])){
		deletedCounter++
		}
	}
progressDlg.hide();

var msg = "Elementos deletados: " + deletedCounter;

return msg;
////////////////////////////////////////////////FUNCOES EXTRAS//////////////////////////////////////////////
	function listToDeleteFolders(){//lista todos elementos nao usados para ser deletados
	var finalList = [];
	var usedElements = listUsedElements();

		for(var i=0; i<element.numberOf(); i++){
		var ElementId = element.id(i);
		var folder = element.completeFolder(ElementId);
			if(usedElements.indexOf(folder) == -1){
			finalList.push(folder);
			}
		}

	return finalList;	

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

	function removeDir(dirPath){//Remove a pasta dada como parametro
	var dir = new Dir;
	dir.path = dirPath;
		if(!dir.exists){
		MessageLog.trace("Diretorio nao encontrado: " + dirPath);
		return false;
		}
	MessageLog.trace("Diretorio removido..." + dirPath);
	dir.rmdirs();
	return true;
	}
}