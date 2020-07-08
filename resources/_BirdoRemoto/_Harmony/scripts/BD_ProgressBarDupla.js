  /*
-------------------------------------------------------------------------------
Name:		BD_ProgressBarDupla.js

Description:	Este script cria uma progress Bar dupla;

Usage:		Para ser chamado em outros scripts;

Author:		Leonardo Bazilio Bentolila

Created:	Maio, 2020

Copyright:   leobazao_@Birdo
 
-------------------------------------------------------------------------------
*/
function BD_ProgressBarDupla(titulo, subtitulo){
this.rootBirdo = "C:/_BirdoRemoto/_Harmony";//FIXME: Caminhos HOMEOFFICE

	if(about.isMacArch()){//muda os caminhos no caso de ser MacOs
	this.rootBirdo = "/Users/" + about.getUserName() + "/Library/_BirdoRemoto/_Harmony";
	}

this.ui = UiLoader.load(this.rootBirdo + "/UI/ProgressBarDupla.ui");


this.pix = new QPixmap;
this.pix.load(this.rootBirdo + "/image/logoBirdo.jpg");
this.ui.logo.pixmap = this.pix;
this.ui.logo.text = null;

this.ui.titulo.setText(titulo);
this.ui.subTitulo.setText(subtitulo);

}


	