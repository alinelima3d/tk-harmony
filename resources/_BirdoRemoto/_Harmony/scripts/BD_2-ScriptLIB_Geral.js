/*
-------------------------------------------------------------------------------
Name:		BD_2-ScriptLIB_Geral.js

Description:	Este script armazena a lib de funções gerais mais usadas referentes a nodes, grupos, etc...

Usage:		Usar em outros scripts atraves do include

Author:		Leonardo Bazilio Bentolila

Created:	junho, 2020.
            
Copyright:  leobazao_@Birdo
-------------------------------------------------------------------------------
*/

//################OBJETOS#########################//
	/*cria um objeto com os valores e keys passados OBS> os dois parametros tem que ter o mesmo tamanho
	@keyList => array de keys do objeto
	@valList => array cos valores na ordem da array de keys
	*/
	function BD2_CriaObjeto(keyList, valList){
		if(keyList.length != valList.length){
		MessageBox.information("Funcao CriaObjeto: Parametros invalidos! Ambas listas devem conter o mesmo numero de itens!!");
		return false;
		}	
	var obj = {};
		for(var i=0; i<keyList.length; i++){
		obj[keyList[i]] = valList[i];
		}
	return obj;
	}


//#################COLUMN#############################//
	/*Lista Todos os drawings do node SELECIONADO na mesma ordem da library de desenhos
	*/
	function BD2_getTimingsOfSelected(){
	scene.beginUndoRedoAccum("list timings");
	this.selected = selection.selectedNode(0);
		if(node.type(this.selected) != "READ"){
		MessageLog.trace("Falha ao listar timings! Node selecionado nao e READ!");
		return false;
		}
	this.coluna = node.linkedColumn(this.selected, "DRAWING.ELEMENT");
	this.timings = column.getDrawingTimings(this.coluna);
	this.frame = frame.current();
	this.listFinal= [];
	column.setEntry(this.coluna, 1, this.frame, "");
		for(var i=0; i<this.timings.length; i++){//loop a quantidade de timings para listar
		Action.perform("onActionSelectedElementSwapToNextDrawing()", "timelineView");
		this.nextTiming = column.getEntry(this.coluna, 1, this.frame);
		this.listFinal.push(this.nextTiming);
		}
	scene.cancelUndoRedoAccum();
	return this.listFinal;
	}

//#################NODES #############################//
	/*Lista todos os nodes dentro do grupo dado, usa filtros par ao tipo
	@firstGroup => grupo inicial para listar os nodes dentro
	@typeList => array com tipos de nodes a ser listados ("" vazio para nao filtrar e retornar TODOS nodes)
	*/
	function BD2_ListNodesInGroup(firstGroup, typeList){
	this.useTypeFilter = true;
		if(typeList == ""){
		this.useTypeFilter = false;
		}
	this.finalList = [];
	this.subNodes = node.subNodes(firstGroup);
	listaRecursiva(this.subNodes);
		function listaRecursiva(nodeList){
			for(var i=0; i<nodeList.length; i++){
			this.tipo = node.type(nodeList[i]);
				if(!this.useTypeFilter){
				this.finalList.push(nodeList[i]);
				} else if(typeList.indexOf(this.tipo) != -1){
				this.finalList.push(nodeList[i]);
				}
				if(this.tipo == "GROUP"){
				listaRecursiva(node.subNodes(nodeList[i]));
				}
			}	
		}
	return this.finalList;
	}


