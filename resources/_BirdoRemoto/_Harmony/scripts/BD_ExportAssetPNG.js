/*
-------------------------------------------------------------------------------
Name:		BD_ExportAssetPNG.js

Description:	Este Script exporta os PNGs do Asset;

Usage:		Verifica se é um Asset, da opcão de renderizar o ColourCard ou fundo Alpha;

Author:		Leonardo Bazilio Bentolila

Created:	Abril, 2020; Update(export sem Versao)
            
Copyright:   leobazao_@Birdo
 
-------------------------------------------------------------------------------
*/
function BD_ExportAssetPNG(){
scene.beginUndoRedoAccum("Export PNGs");

	if(!isAsset()){//checa se e uma cena Asset Padrao!
	return;
	}
	if(!changeExport()){//muda o export pro caminho atual
	return;
	}

var options = dialogOptions();

	if(!changeOptions(options[0], options[1], options[2])){
	MessageBox.information("Não será possivel aplicar as Opcoes! O Setup esta desatualizado ou foi alterado!\Atualize antes de exportar!!");
	return;
	}	
Action.perform("onActionComposite()");

changeOptions(false, true, false);//volta pro certo

scene.endUndoRedoAccum();

///////////////////////////////funcoes complementares//////////////////////////
	function isAsset(){
	var scArr = scene.currentScene().split("_");
		if(node.getName("Top/SETUP")==""){
		MessageBox.information("Este arquivo não é um Asset!")
		return false; 
		}
		if(scArr[0].length != 5){
		MessageBox.information("O nome deste Asset cena não está no padrão!\nRenomeie  antes de exportar!");
		return false; 
		}
	return true;
	}

	function changeExport(){//Funcao que muda o export pro caminho fora da cena atual
	var scenePath = scene.currentProjectPath();
	var vers = getVersionName(scenePath);
		if(vers != ""){
		scenePath = scenePath.replace(vers, "");
		}
	var exportNode = "Top/SETUP/EXPORT";
	node.setTextAttr(exportNode, "DRAWING_NAME", 0, scenePath);
	MessageLog.trace("Export atualizado com sucesso!!");
	return true;
		function getVersionName(name){//reto retorna versao do nome se tiver
		var version = name.slice(-4);
			if(version.slice(0,2).toUpperCase() == "_V" && !isNaN(version.slice(-2))){
			return version;
			}
			if(version[2].toUpperCase() == "V" && !isNaN(version[3])){
			return version.slice(-3);
			}
		return "";
		}
	}

	function changeOptions(boolAlpha, boolLineUp, boolRef){//muda as opcoes
	var coCard = "Top/SETUP/Visibility_ColourCard";
	var lineUp = "Top/SETUP/Visibility_LineUp";
	var ref = "Top/SETUP/Visibility_Ref";	
		if(node.getName(coCard) == "" || node.getName(ref) == ""){
		return false;
		}
	node.setTextAttr(coCard, "SOFTRENDER", 1, !boolAlpha);
	node.setTextAttr(lineUp, "SOFTRENDER", 1, boolLineUp);
	node.setTextAttr(ref, "SOFTRENDER", 1, boolRef);
	desligaTransparency();
	return true;
	
		function desligaTransparency(){//desliga qualquer transparencia no arquivo
		var setup = "Top/SETUP";
		var nodesCon = node.numberOfInputPorts(setup);
			for(var i=0; i< nodesCon; i++){
			var nod = node.srcNode(setup, i);
				if(node.type(nod) == "FADE"){
				node.setEnable(nod, !boolRef);
				}
			}
		}
	}

	function dialogOptions(){//Dialog para escolher opcoes do render, retorna um bool das opcoes na ordem em forma de array
	var d = new Dialog();
	d.title = "Render PNG Options";

	var label1 = new Label();
	label1.text = "Escolha as Opções da Imagem";
	d.add(label1);
	d.addSpace(3);

	var group = new GroupBox;   
	var alpha = new CheckBox;
	var ref = new CheckBox;
	var lineUp = new CheckBox;
	
	group.add(alpha);
	group.add(lineUp);
	group.add(ref);
		
	d.addSpace(1);
	d.add(group);
	
	alpha.checked = true;
	alpha.text = "Fundo Transparente";
	alpha.toolTip = "Checa isso para exportar a PNG com o fundo em Alpha";
	
	lineUp.checked = true;
	lineUp.text = "Exportar LineUp";
	lineUp.toolTip = "Checa isso para incluir a Referencia no Render";

	ref.checked = false;
	ref.text = "Exportar Referencia";
	ref.toolTip = "Checa isso para incluir a Referencia no Render";


	d.okButtonText = "Continuar...";
	if(!d.exec()){
	return false;
	} else {
	return [alpha.checked, lineUp.checked, ref.checked];
	}
	}
}