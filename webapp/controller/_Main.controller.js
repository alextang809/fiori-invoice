sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",


], function (Controller, JSONModel, MessageToast) {
  "use strict";

  return Controller.extend("ypoc.course.ypoccourse.controller.Main", {
  

    onInit: function () {
      // Sample JSON data for courses
      this.oCoursesModel = new JSONModel({
        "courses": [
          { "name": "CA01", "start_date": "08-09-2023", "end_date": "08-09-2023", "type": "Classroom", "duration": 0.5, "applicants": 25 },
          { "name": "CA02", "start_date": "08-09-2023", "end_date": "08-10-2023", "type": "Classroom", "duration": 1.5, "applicants": 50 },
          { "name": "FI07", "start_date": "08-10-2023", "end_date": "08-11-2023", "type": "Classroom", "duration": 2, "applicants": 31 },
          { "name": "FI15", "start_date": "08-14-2023", "end_date": "08-16-2023", "type": "Classroom", "duration": 3, "applicants": 22 },
          { "name": "EM03", "start_date": "08-15-2023", "end_date": "08-17-2023", "type": "Virtual", "duration": 3, "applicants": 21 },
          { "name": "PU01", "start_date": "08-16-2023", "end_date": "08-18-2023", "type": "Virtual", "duration": 3, "applicants": 15 },
          { "name": "PU02", "start_date": "08-17-2023", "end_date": "08-18-2023", "type": "Virtual", "duration": 2, "applicants": 3 },
          { "name": "PU03", "start_date": "08-21-2023", "end_date": "08-23-2023", "type": "Virtual", "duration": 2.5, "applicants": 5 },
          { "name": "IM06", "start_date": "08-22-2023", "end_date": "08-24-2023", "type": "Classroom", "duration": 3.0, "applicants": 8 },

          // Add more courses as needed
        ]
      });

      this.getView().setModel(this.oCoursesModel, "courses");

      //init the model ?
      this.oSelectedCoursesModel = new JSONModel({
        SelectedCourses: []
      });
      this.getView().setModel(this.oSelectedCoursesModel, "SelectedCourses");

      //to populate cards on load/init
      var today = new Date();
      var oneYearFromToday = new Date(today);
      oneYearFromToday.setFullYear(today.getFullYear() + 1);
      this.populateTiles(today, oneYearFromToday);

       // Attach the select event to the IconTabBar
      var oIconTabBar = this.byId("idIconTabBar");
      oIconTabBar.attachSelect(this.onIconTabSelect, this);
    },

    onSearchCourses: function (oEvent) {
      var sSearchTerm = oEvent.getParameter("query");
      var oStartDate = this.byId("dateRangeFilter").getDateValue();
      var oEndDate = this.byId("dateRangeFilter").getSecondDateValue();
      this.populateTiles(oStartDate, oEndDate, sSearchTerm);
    },
    

    onDateRangeChange: function (oEvent) {
      var oStartDate = oEvent.getParameter("from");
      var oEndDate = oEvent.getParameter("to");
      this.populateTiles(oStartDate, oEndDate);
    },

    populateTiles: function (startDate, endDate, searchQuery) {
      var oTileContainer = this.byId("tileContainer");
      var aCourses = this.oCoursesModel.getProperty("/courses");

      // Clear existing tiles
      oTileContainer.removeAllItems();

      // Filter courses based on the selected date range
      var aFilteredCourses = aCourses.filter(function (oCourse) {
        var oCourseStartDate = new Date(oCourse.start_date);
        var oCourseEndDate = new Date(oCourse.end_date);

        // Include the course if its start or end date falls within the selected range
        return (oCourseStartDate >= startDate && oCourseStartDate <= endDate) ||
          (oCourseEndDate >= startDate && oCourseEndDate <= endDate) ||
          (oCourseStartDate <= startDate && oCourseEndDate >= endDate) ||
          (oCourseStartDate.toDateString() === startDate.toDateString() && oCourseEndDate.toDateString() === endDate.toDateString()) ||
          (oCourseStartDate.toDateString() === startDate.toDateString() && oCourseEndDate.toDateString() !== endDate.toDateString()) ||
          (oCourseStartDate.toDateString() !== startDate.toDateString() && oCourseEndDate.toDateString() === endDate.toDateString());
      });

      // Create tiles for the filtered courses
      var that = this; // Store the reference to the controller
      aFilteredCourses.forEach(function (oCourse) {
        var indicator, indicatorColor, icon;
        if (oCourse.applicants < 10) {
          indicator = "Down"; // Green up indicator
          indicatorColor = "Good";
          //icon = "sap-icon://navigation-up-arrow";
        } else if (oCourse.applicants < 20) {
          indicator = "None"; // Yellow - no indicator
          indicatorColor = "Critical";
          //icon = "sap-icon://less";
        } else {
          indicator = "Up"; // Red down indicator
          indicatorColor = "Error";
          //icon = "sap-icon://navigation-down-arrow";
        }



        var oGenericTile = new sap.m.GenericTile({
          header: oCourse.name,
          subheader: oCourse.start_date,
          headerImage: that.getHeaderIcon(oCourse.type),
          tileContent: new sap.m.TileContent({
            footer: "Duration: " + oCourse.duration + " days",
            //unit: "yes",
            content: new sap.m.NumericContent({
              value: oCourse.applicants,
              //valueColor: iconColor,
              scale: "Applicants",
              size: "M",
              icon: icon,
              indicator: indicator, // Set the indicator based on the number of applicants
              valueColor: indicatorColor,



            })

          }),

          press: function () {
            // Call the onTilePress function and pass the event source
            that.onTilePress(oCourse.name, oCourse.start_date, oCourse.duration);
          }

        });
        oGenericTile.addStyleClass("customTileBackground");

        oTileContainer.addItem(oGenericTile);
      });


    },
    handleListItemPress: function(oEvent) {
      var oSelectedItem = oEvent.getSource();
      var oSelectedCourse = oSelectedItem.getBindingContext("courses").getObject();
  
      // Update the course details in the side panel
      this.byId("courseDescription").setText(oSelectedCourse.description);
  
      // Format the dates using the desired format
      var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern: "ddd, dd-MMM-yy"});
      this.byId("courseStartDate").setText("Start Date: " + oDateFormat.format(new Date(oSelectedCourse.start_date)));
      this.byId("courseEndDate").setText("End Date: " + oDateFormat.format(new Date(oSelectedCourse.end_date)));
  },

  handleCoursePress: function (oEvent) {
    // Get the binding context of the clicked tile
    var oBindingContext = oEvent.getSource().getBindingContext("courses");
    var oSelectedCourse = oBindingContext.getObject();

    // Set the selected course data to another model or context
    this.getView().setModel(new JSONModel(oSelectedCourse), "selectedCourse");

    // Optionally, update the side content UI to reflect the selected course's details
    // For example, update texts, labels, etc.
    // You can also navigate to a specific tab or expand a specific section in the side content
  },

  onTeamFilterChange: function(oEvent) {
    var sSelectedTeam = oEvent.getParameter("selectedItem").getKey();
    var oList = this.byId("yourCourseListOrGridId"); // Update with your actual control ID
    var oBinding = oList.getBinding("items");
    
    if (sSelectedTeam) {
        oBinding.filter(new sap.ui.model.Filter("team", sap.ui.model.FilterOperator.EQ, sSelectedTeam));
    } else {
        oBinding.filter([]); // Remove the filter if no team is selected
    }
  },

  
    // Function to handle tile press event
    onTilePress: function (sHeader, sSubHeader, sDuration) {
      var oSelectedCoursesData = this.oSelectedCoursesModel.getData();
      var aSelectedCourses = oSelectedCoursesData.SelectedCourses;

      // Find the course details for the selected tile from the courses model
      var aCourses = this.oCoursesModel.getProperty("/courses");
      var oSelectedCourse = aCourses.find(function (oCourse) {
        return oCourse.name === sHeader && oCourse.start_date === sSubHeader;
      });

      if (!oSelectedCourse) {
        return;
      }

      var sType = oSelectedCourse.type;

      // Check if the course is already in the selected list
      var bCourseExists = aSelectedCourses.some(function (oCourse) {
        return oCourse.name === sHeader && oCourse.subheader === sSubHeader;
      });

      if (!bCourseExists) {
        // Add the course details to the selected list
        aSelectedCourses.push({
          name: sHeader,
          subheader: sSubHeader,
          duration: sDuration,

          type: sType,
        });

        // Update the model data and directly set the list items property
        this.oSelectedCoursesModel.setProperty("/SelectedCourses", aSelectedCourses);
        var oList = this.byId("selectedCoursesList");
        oList.removeAllItems();
        aSelectedCourses.forEach(function (oCourse) {
          oList.addItem(new sap.m.StandardListItem({
            title: oCourse.name,
            description: oCourse.subheader,
            info: oCourse.type + ", " + oCourse.duration + " days",

          }));
        });
      }

      MessageToast.show("You clicked on the course: " + sHeader);
    },

    // Function to handle list item press event
    handleDelete: function (oEvent) {
      var oListItem = oEvent.getParameter("listItem");
      var sTitle = oListItem.getTitle();
      var sDescription = oListItem.getDescription();

      var oSelectedCoursesData = this.oSelectedCoursesModel.getData();
      var aSelectedCourses = oSelectedCoursesData.SelectedCourses;

      // Filter out the selected item from the array
      var aFilteredCourses = aSelectedCourses.filter(function (oCourse) {
        return oCourse.name !== sTitle || oCourse.subheader !== sDescription;
      });

      // Update the model data and rebind the list
      this.oSelectedCoursesModel.setProperty("/SelectedCourses", aFilteredCourses);

      // Remove the list item from the list
      var oList = this.byId("selectedCoursesList");
      oList.removeItem(oListItem);

      MessageToast.show("Course deselected and removed: " + sTitle);
    },

    getHeaderIcon: function (courseType) {
      // Return the header icon based on the course type
      if (courseType === "Virtual") {
        return "sap-icon://video"; // Use the appropriate icon for virtual courses (e.g., "sap-icon://video")
      } else if (courseType === "Classroom") {
        return "sap-icon://person-placeholder"; // Use the appropriate icon for physical courses (e.g., "sap-icon://customer-and-supplier")
      } else {
        return "sap-icon://question-mark"; // Default icon for unknown course types
      }
    },

    submit: function(){
      MessageToast.show("submitted!");
    },
    


  });
});
