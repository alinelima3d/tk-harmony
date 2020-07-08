"use strict";
/* v 2.0 (fix do bug quando ja havia um note criado sem o scritp)
-------------------------------------------------------------------------------
Name:		BD_AddNOTES.js

Description:	Este Script adiciona um node de NOTE no grupo _Note;

Usage:		Uso de exclusividade da Supervisão;

Author:		Leonardo Bazilio Bentolila

Created:	Novembro, 2018. UPDATE(Maio, 2020)
            
Copyright:  Camelo@ e leobazao_@Birdo
-------------------------------------------------------------------------------
*/
function BD_AddNOTES(){
scene.beginUndoRedoAccum("Add Note");
var _notes = "Top/_NOTES";

	if(node.getName(_notes)==""){
	MessageBox.information("Essa cena não tem um espaço dedicado para receber notes.");
	return;
	}

var composite = _notes + "/Composite";
var tempNotesList = node.subNodes(_notes);
var listNumbers = [];

	for(var i=0; i<tempNotesList.length; i++){
		if(node.type(tempNotesList[i]) == "READ"){
		node.setEnable(tempNotesList[i], false);
		var nome = node.getName(tempNotesList[i]);
		var arr = nome.split("_");
			if(arr[0] == "NOTE" && !isNaN(arr[1])){
			listNumbers.push(arr[1]);
			}
		}
	}

var nodeName =  getNextNoteNAME(listNumbers);
var a = novoDrawing(_notes, nodeName);
var saida = _notes + "/Multi-Port-In";
var addPort;
	if(node.numberOfOutputPorts(saida) == 0){
	addPort = true;
	} else {
	addPort = false;
	}

node.link(saida, 0, a, 0, addPort, true);
node.link(a, 0, composite,0); 

organizaNotes(composite);

selection.clearSelection();
selection.addNodeToSelection(a);
Action.perform("onActionChooseBrushTool()");
node.setAsGlobalDisplay("Top/SETUP/_PREVIEW");
preferences.setBool("DRAWING_LIGHTTABLE_ENABLE_SHADE_FRAME_VIEW", false);

scene.endUndoRedoAccum();

/////////////////////////////////////////////FUNCOES EXTRAS////////////////////////////////////////////////////
	function getNextNoteNAME(numeros){//pega o nome para o proximo NOTE
	numeros.sort();
		if(numeros.length == 0){
		return "NOTE_1";
		}
	var lastNum = numeros[numeros.length -1];
	var next = parseFloat(lastNum) + 1;
	return "NOTE_" + next;
	}	

	function novoDrawing(group, name){
	var id = element.add(name, "BW", scene.numberOfUnitsZ(), "SCAN", "TVG");
	column.add(name, "DRAWING");
	column.setElementIdOfDrawing(name, id);
	var tempNode = node.add(group,name, "READ", 0, 0, 0);
	node.linkAttr(tempNode, "DRAWING.ELEMENT", name);
	return tempNode;
	}

	function organizaNotes(comp){
	var space = 30; // Define o espaço entre os nodes//
	var nodesCon = node.numberOfInputPorts(comp);
	var startCoordX = defineCoordXPrimeiroNode(comp);
	var startCoordY = node.coordY(comp);
	//organiza pra cima os nodes a partir da comp selecionada//
		for(var i=0;i<nodesCon;i++){
		var n1 = node.srcNode(comp,i);
			if(node.type(n1)!="MULTIPORT_IN" && n1!=" " ){ //evita possiveis erros//
			var n1Size = node.width(n1);
			startCoordX = startCoordX - (n1Size + space);
			node.setCoord(n1, startCoordX, (startCoordY - 150));
			}
		}

	function defineCoordXPrimeiroNode(Comp){
	//define posicao do primeiro node a direita baseado no numero de nodes conectado na comp, com espaço entre eles como parametro//
	var xPosComp = node.coordX(Comp);
	var coord = 0;
	var ports = node.numberOfInputPorts(Comp);
		for(var i=0; i<ports; i++){
		var nC = node.srcNode(Comp,i);
		var nodeSize = node.width(nC);
		coord = coord + nodeSize;
		}
	var mid = Math.floor(coord / 2);		
	var posFINAL = xPosComp + mid + node.width(node.srcNode(Comp,0));
	return posFINAL;
	}
	}

}