  /*
-------------------------------------------------------------------------------
Name:		BD_CleanPalettes_BAT.js

Description:	Este Script deleta todas as palettas nao usadas do arquivo

Usage:		Usado Como Batch para limpar as palettes nao usadas do arquivo sem precisar Abri-lo

Author:		Leonardo Bazilio Bentolila

Created:	abril, 2020;
            
Copyright:   leobazao_@Birdo
-------------------------------------------------------------------------------
*/
BD_CleanPalettes_BAT();

function BD_CleanPalettes_BAT(){
var peletasUsadas = getUsedPalettes();
var curPaletteList = PaletteObjectManager.getScenePaletteList();

	if(curPaletteList.getLock()){
	curPaletteList.releaseLock();
	}
	for(var i=(curPaletteList.numPalettes-1); i>=0; i--){
	var palette = curPaletteList.getPaletteByIndex(i);
		if(palette.getLock()){
		palette.releaseLock();
		}
	var palettName = palette.getName();
		if(peletasUsadas[1].indexOf(palettName) == -1 && palette.isValid()){
			if(curPaletteList.removePaletteById(palette.id)){
			deleteFile(palette.getPath() + "/" + palettName + ".plt");
			MessageLog.trace("Palette: " + palettName + " deletada com sucesso!");
			} else {
			MessageLog.trace("Falha ao deletar a paletta: " + palettName);				
			}
		}
	}

//////////////////////////////FUNCAO EXTRA/////////////////////////////////////////////////////////////////
	function deleteFile(filePath){//deleta arquivo
	var file = new File(filePath);
		if(!file.exists){
		return false;
		} else {
		file.remove();
		return true;
		}
	}

	function getUsedPalettes(){//retorna [0] palettes ids [1] palettes names usados na cena
	var currentCount = 0;
	var drawingCount = 0;
	var progressDlg; 
	var usedPalettesIds = [];
	var namePalettList = [];
	var finalArray = [];
		for(var i=0; i<element.numberOf(); i++){
		var ElementId = element.id(i);
		drawingCount += Drawing.numberOf(ElementId);
		}
		if(drawingCount==0){
		drawingCount = 1;
		}
	
		for(var i=0; i<element.numberOf(); i++){
		var ElementId = element.id(i);
		var elementPaletteList = PaletteObjectManager.getPaletteListByElementId(ElementId);
			for(var j=0; j<Drawing.numberOf(ElementId); j++){
			currentCount += 1;
			var drawingId = Drawing.name(ElementId,j);
			var colorArray = DrawingTools.getDrawingUsedColors({elementId : ElementId, exposure : drawingId});
				for(var colorIndex = 0; colorIndex < colorArray.length; colorIndex++){
				var palettID = elementPaletteList.findPaletteOfColor(colorArray[colorIndex]);
				var paletName = palettID.getName();
					if(namePalettList.indexOf(paletName) == -1 && palettID.isValid()){
					usedPalettesIds.push(palettID);
					namePalettList.push(paletName);
					}
				}
			}
		}
	finalArray.push(usedPalettesIds);
	finalArray.push(namePalettList);
	return finalArray;
	}
}