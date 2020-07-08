/* V 1.0
-------------------------------------------------------------------------------
Name:		BD_SetupANIM_BASICO.js

Description:	Este Script faz o SETUP basico da cena aberta!

Usage:		Testando abrir a opcao de import de PSD no fim... a melhorar!

Author:		Leonardo Bazilio Bentolila

Created:	Abril, 2020;
            
Copyright:   leobazao_@Birdo
-------------------------------------------------------------------------------
*/
include("BD_ImportAnimSETUP_BAT.js");


function BD_SetupANIM_BASICO(){
	
	if(!checkVPN()){
	MessageLog.trace("Falha ao Conectar o Servidor da birdo!");
	return;
	}

var setup = BD_ImportAnimSETUP_BAT();

	if(!setup){
	MessageLog.trace("Import SETUP falhou nesta cena!!");
	return;
	}

var bgPath = getBGcenaPATH(setup[4]);
openIMPORTPSD(fileMapper.toNativePath(bgPath));

scene.saveAll();

//se quiser que feche a cena quando apertar libere essa funçao!
//scene.closeSceneAndExit();

/////////////////FUNCOES EXTRAS/////////////////////////////////
	function openIMPORTPSD(psdPath){//abre o dialog de render para apertar o ok
	preferences.setString("IMPORTIMGDLG_IMAGE_NEWLAYERNAME", "BG");
	preferences.setString("IMPORTIMGDLG_IMAGE_LASTIMPORT", psdPath);
	Action.perform("onActionImportDrawings()");
	}

	function getBGcenaPATH(bgRoot){
	var episode = String(scene.currentScene().split("_")[1]);
	var myDir = new Dir();
	myDir.path = bgRoot;
	var fileList = myDir.entryList("*", 1, 4);
		for(var i=0; i<fileList.length; i++){
		var item = String(fileList[i].split("_")[0]);
			if(item == episode){
			return bgRoot + fileList[i] + "/2Postboard/6_FECHAMENTO/CENAS";
			}
		}
	MessageLog.trace("Ainda nao existe a pasta de BGs desse episodio!!");
	return false;
	}

	function checkVPN(){//checa conexao com o servidor da birdo!
	var rede = "//192.168.10.101";
	var progressDlg;
	progressDlg = new QProgressDialog();
	progressDlg.open();
	progressDlg.setLabelText("Testando Conexao VPN");
	progressDlg.setRange(5, 1);
	var dir = new Dir;
	dir.path = rede;
	var conexao = dir.exists;
	progressDlg.hide();
		if(!conexao){
		MessageBox.information("Nao foi possivel conectar o Servidor da Birdo " + rede + "\nTente reconectar o VPN, se nao conseguir, avise a TI!!!");
		return false;
		}
	return true;
	}

//CRIAR FUNCAO PARA ORGaNIZAR O BG

}