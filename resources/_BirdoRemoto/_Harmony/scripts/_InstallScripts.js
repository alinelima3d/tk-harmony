/*
-------------------------------------------------------------------------------
Name:		_InstallScripts.js

Description:	Este Script instala os scripts locais para trabalhar remoto;

Usage:		Deve ser importado e rodado para instalar todos os scripts: 	

Author:		Leonardo Bazilio Bentolila

Created:		marco de 2020;
            
Copyright:   leobazao_@Birdo
 
-------------------------------------------------------------------------------
*/
function BD_InstallScripts(){

var bin = specialFolders.userConfig;

var packScripts = "C:/_BirdoRemoto/_Harmony/scripts";
var iconsPath = "C:/_BirdoRemoto/_Harmony/script-icons"

	if(about.isMacArch()){//muda os caminhos no caso de ser MacOs
	packScripts = "/Users/" + about.getUserName() + "/Library/_BirdoRemoto/_Harmony/scripts";
	iconsPath = "/Users/" + about.getUserName() + "/Library/_BirdoRemoto/_Harmony/script-icons"
	}

	var dirPack = new Dir;
	dirPack.path = packScripts;
		if(!dirPack.exists){
		MessageBox.information("A pasta de scripts ainda nao foi criada! Extraia a pasta do pacote para: 'C:/_BirdoRemoto'");
		return;
		}

var pref = bin.slice((bin.length-15), bin.length);
var scrip = pref.replace("full-", "");
scrip = scrip.replace("pref", "scripts");

var systemScripts = bin.replace(pref, scrip);
var systemIcons = systemScripts + "/script-icons";


var countScript = 0;
var countIcon = 0;

MessageLog.trace("	Inicio Coping Scriptis...");
	
copyScripts(packScripts);



	///funcoes extras/////////////////////////////
	function copyScripts(scriptsPath){//copia os scripts do pack p/ programa
	var myDir = new Dir();
	myDir.path = scriptsPath;
	var fileList = myDir.entryList("*.js",2,4);

		for(var i=0;i<fileList.length;i++){//copy js
		var item = fileList[i];
		copyFile(packScripts + "/" + item, systemScripts + "/" + item);
		countScript++;

		}
	var dirIcon = new Dir();
	dirIcon.path = iconsPath;
	var iconList = dirIcon.entryList("*",2,4);
		
		for(var y=0;y<iconList.length;y++){//copy icons
		var icon = iconList[y];
		copyFile(iconsPath + "/" + icon, systemIcons + "/" + icon);
		countIcon++;
		}
	MessageBox.information("Pronto! Scripts e Icons, foram Instalados!\n" + countScript + " Scripts foram atualizados!\n" + countIcon + " Itens do Icon foram atualizados!\nAperte o botao 'Refresh Script File List' na janela Script Editor e voce ja pode instalar os botoes nas janelas desejadas!");


	function copyFile(copyPath,pastePath){//Copia um Arquivo para o caminho dado
	var fileToCopy = new PermanentFile(copyPath);
	var copyOfFile = new PermanentFile(pastePath);
	var copy = fileToCopy.copy(copyOfFile);
		if(copy){
		MessageLog.trace("File was copied: " + pastePath);
		} else { 
		MessageLog.trace("Failed to copy file: " + pastePath);
		}
	}
	}		

}