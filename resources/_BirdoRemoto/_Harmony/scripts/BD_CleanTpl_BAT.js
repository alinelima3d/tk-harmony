  /*
-------------------------------------------------------------------------------
Name:		BD_CleanTpl_BAT.js

Description:	Este Script limpa a library de drawings do RIG, eliminando os X e drawings do FULL q so devem ficar nas poses

Usage:		Usado Como Batch para limpar o TPL do Rig de drawings desnecessarios;

Author:		Leonardo Bazilio Bentolila

Created:	abril, 2020;
            
Copyright:   leobazao_@Birdo
-------------------------------------------------------------------------------
*/
BD_CleanTpl_BAT();

function BD_CleanTpl_BAT(){

var cena = scene.currentScene();
var rigCh = "Top/" + cena.slice(0, (cena.length-8));

	if(node.getName(rigCh) == ""){
	MessageLog.trace("Rig nao encontrado no TPL!");
	return false;
	}

var allNodes = listaNodesRIG(rigCh);
var delFull = deletaDrawingsFULL(allNodes);
var delX = removeXDrawings(allNodes);

MessageLog.trace("Drawings Full deletados: " + delFull);
MessageLog.trace("Drawings X deletados : " + delX);

updateINFOTxt("Draws 'X' deletados:" + delX, "Draws 'FULL' deletados:" + delFull);


////////////////////////FUNCOES EXTRAS //////////////////////////////////////////////
	function listaNodesRIG(rig){//retorna lista com todos os Rigs
	var listToFill = [];
	listaRecursivamente(node.subNodes(rig));
		function listaRecursivamente(a){
		for(var i = 0;i<a.length;i=i+1){
		listToFill.push(a[i]);
			if(node.type(a[i]) == "GROUP"){
			listaRecursivamente(node.subNodes(a[i]));
			}
		}
		}
	return listToFill;
	}

	function removeXDrawings(nodes){//remove os drawings X
	var counter = 0;
		for(var i=0; i<nodes.length; i++){
			if(node.type(nodes[i]) != "READ"){
			continue;
			}
	var coluna = node.linkedColumn(nodes[i],"DRAWING.ELEMENT");
	var timmings = column.getDrawingTimings(coluna);
			for(var y=0; y<timmings.length; y++){
				if(timmings[y][0] == "X"){
				var currExposure = column.getEntry(coluna, 1, 1);
				column.setEntry(coluna,1 , 1, timmings[y]);
				column.deleteDrawingAt(coluna, 1);
				column.setEntry(coluna,1 , 1, currExposure);
				counter++;
				}
			}
		}
	return counter;
	}
	
	function deletaDrawingsFULL(rig){//limpa a library de drawings dos  nodes FULL, deixa so o Zzero
	var counter = 0;
		for(var i=0; i<rig.length; i++){
			if(node.type(rig[i]) == "READ" && node.getName(rig[i]).indexOf("_FULL_") != -1){
			var coluna = node.linkedColumn(rig[i],"DRAWING.ELEMENT");
			var timmings = column.getDrawingTimings(coluna);
				for(var y=0; y<timmings.length; y++){
					if(timmings[y] != "Zzero"){
					var currExposure = column.getEntry(coluna, 1, 1);
					column.setEntry(coluna,1 , 1, timmings[y]);
					column.deleteDrawingAt(coluna, 1);
					column.setEntry(coluna,1 , 1, currExposure);
					counter++;
					}
				}
			}
		}
	return counter;
	}
	
	function updateINFOTxt(texto1, texto2){//atualiza o txt com info do clian TPL
	var filePath = scene.currentProjectPath() + "/_LibraryTplINFO.txt";
	var file = new File(filePath);
		if(!file.exists){
		return false;
		}
	file.open(FileAccess.Append);
	file.writeLine("----------CLEAN RIG DRAWINGS--------");
	file.writeLine(texto1);
	file.writeLine(texto2);
	file.close();
	}
}





