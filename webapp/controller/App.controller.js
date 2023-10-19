sap.ui.define(
    [
        "sap/ui/core/mvc/Controller"
    ],
    function(BaseController) {
      "use strict";
  
      return BaseController.extend("ypoc.course.ypoccourse.controller.App", {
        onInit: function () {
          var oInput = this.getView().byId("companyCodeField");
          oInput.setValue("BUKRS");
        }
      });
    }
  );
  