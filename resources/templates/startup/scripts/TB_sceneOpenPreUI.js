/*
  Function: TB_sceneOpenPreUI_Offline
  Description: function executes when opening an existing offline scene before the UI (views, layouts) have
               been created and loaded.
  Note: This script is also executed when opening a template for editing.
 */ 
include( "TB_RelinkPaths.js" )

function TB_sceneOpenPreUI_Offline(){
TB_RelinkPathsInteractive();

MessageBox.information("Funcionaaa!!!");

}

/*
  Function: TB_sceneOpenPreUI_Online
  Description: function executes when opening an existing database scene before the UI (views, layouts) have
               been created and loaded.
 */ 
function TB_sceneOpenPreUI_Online()
{
}
