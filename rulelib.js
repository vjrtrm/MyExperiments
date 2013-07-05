// Extend csStudio with decision rule namespace
csStudio.global.extend(csStudio, "rule.decision.data");
csStudio.global.extend(csStudio, "rule.decision.methods");
csStudio.global.extend(csStudio, "rule.decision.search");
csStudio.global.extend(csStudio, "rule.decision.validate");
csStudio.global.extend(csStudio, "rule.decision.ERROR");

csStudio.rule.decision.data = {
	/* Onload list of period, tag & activity list/map */
	periodRuleList: [],
	applicableOfferRuleList: [],
	activityRuleList: [],
	connectorList: ['And','Or'],
	
	/* List of Operators and Values in form field */
	activeOperatorsList: [],
	activeValuesList: [],
	
	/* Current form/row field attribute, Operator, values */
	selectedRule: {
		period: '',
		attribute: '',
		operator: '',
		values: '',
		connector: ''
	},
	
	isActivity: false,
	isTag: false,
	isActivityDisable: false,
	isTagDisable: false,
	
	/* User selected List of rows with attribute, Operator & values */
	selectedRuleList: [],
	
	/* Number of rows created in total & as individual */
	rowCount: 0,
	activityCount: 0,
	tagCount: 0,
	selectedRows: '',
	ruleXML: '',
	
	/* List of Operators and Values in edit form field */
	editAttributesList: [],
	editOperatorsList: [],
	editValuesList: [],
	editRule: {
		period: '',
		attribute: '',
		operator: '',
		values: '',
		connector: ''
	},
	
	/* Methods that updates/manipulates above declared parameters */
	getSelectedPeriod: function () {
		if (!(this.selectedRule.period)) {
			this.setSelectedRule({period:document.getElementById('rule-period').value})
		}
		return this.selectedRule.period;
	},
	getSelectedValues: function () {
		return this.selectedRule.values;
	},
	getEditValues: function () {
		return this.editRule.values;
	},
	getActiveOperatorsList: function () {
		return this.activeOperatorsList;
	},
	getActiveValuesList: function () {
		return this.activeValuesList;
	},
	getSelectedRuleList: function () {
		return this.selectedRuleList;
	},
	getSelectedRow: function () {
		return this.selectedRows;
	},
	getRuleXML: function () {
		if (this.ruleXML=='') {
			this.convertToXML();
		}
		return this.ruleXML;
	},
	getPreviewRuleContent: function () {
		var ruleContent='', i, rulelist = this.selectedRuleList, levelcount=0;
		for (i=0;i<rulelist.length;i++) {
			if(levelcount==0 && rulelist[i].isGroupStart){
				levelcount=rulelist[i].groupLevel;
			}
			ruleContent = (ruleContent=='') ? "PERIOD >= "+this.getSelectedPeriod() +"<br/>": ruleContent;
			ruleContent = ruleContent + '<strong> ' + rulelist[i].connector +' </strong>';
			ruleContent = (rulelist[i].isGroupStart) ? ruleContent + this.getParanthesis('open',rulelist[i].groupLevel): ruleContent;
			ruleContent = ruleContent + '(' + rulelist[i].attribute +' '+rulelist[i].operator+' '+(rulelist[i].values).replace(/\|/g, ', ')+')';
			ruleContent = (rulelist[i].isGroupEnd) ? (ruleContent + this.getParanthesis('close',rulelist[i].groupLevel) + ((levelcount>1)?' ':' </br>')) : ruleContent;
			ruleContent = (rulelist[i].isGrouped) ? ruleContent: ruleContent + '</br>';
			if(levelcount>0 && rulelist[i].isGroupEnd){
				levelcount=levelcount-1;
			}
		}
		return ruleContent;
	},
	getParanthesis: function (type, number) {
		var returnValue="",i;
		if (type === 'open') {
			for(i=0;i<parseInt(number);i++){
				returnValue=returnValue+'(';
			}
		}else if (type === 'close'){
			for(i=0;i<parseInt(number);i++){
				returnValue=returnValue+')';
			}
		}
		return returnValue
	},
	getTextAreaFieldPreview: function () {
		var ruleContent='', i, rulelist = this.selectedRuleList;
		for (i=0;i<rulelist.length;i++) {
			ruleContent = (ruleContent=='') ? "PERIOD >= "+this.getSelectedPeriod(): ruleContent;
			ruleContent = ruleContent + ' ' +rulelist[i].connector + ' ';
			ruleContent = (rulelist[i].isGroupStart) ? ruleContent + this.getParanthesis('open',rulelist[i].groupLevel): ruleContent;
			ruleContent = ruleContent + ' (' + rulelist[i].attribute +' '+rulelist[i].operator+' '+(rulelist[i].values).replace(/\|/g, ', ')+') ';
			ruleContent = (rulelist[i].isGroupEnd) ? ruleContent + this.getParanthesis('close',rulelist[i].groupLevel): ruleContent;
		}
		return ruleContent;
	},
	setSelectedRule: function (selectedRule) {
		if (selectedRule.period || selectedRule.period == "") {
			this.selectedRule.period = selectedRule.period;
		}
		if (selectedRule.attribute || selectedRule.attribute == "") {
			this.selectedRule.attribute = selectedRule.attribute;
		}
		if (selectedRule.operator || selectedRule.operator == "") {
			this.selectedRule.operator = selectedRule.operator;
		}
		if (selectedRule.values || selectedRule.values == "") {
			this.selectedRule.values = selectedRule.values;
		}
		if (selectedRule.connector || selectedRule.connector == "") {
			this.selectedRule.connector = selectedRule.connector;
		}
	},
	setEditRule: function (editRule) {
		if (editRule.period || editRule.period == "") {
			this.editRule.period = editRule.period;
		}
		if (editRule.attribute || editRule.attribute=="") {
			this.editRule.attribute = editRule.attribute;
		}
		if (editRule.operator || editRule.operator=="") {
			this.editRule.operator = editRule.operator;
		}
		if (editRule.values || editRule.values=="") {
			this.editRule.values = editRule.values;
		}
		if (editRule.connector || editRule.connector=="") {
			this.editRule.connector = editRule.connector;
		}
	},
	setActiveOperatorsAndValuesList: function (selectedAttribute) {
		var operators, i;
		if(selectedAttribute==''){
			this.activeOperatorsList= [];
			this.activeValuesList= [];
			return true;
		}
		for (i=0; i<this.applicableOfferRuleList.length; i++) {
			if (this.applicableOfferRuleList[i].attributeName == selectedAttribute) {
				if (!this.isTagDisable) {
					this.activeValuesList = this.applicableOfferRuleList[i].values;
					this.activeOperatorsList = this.applicableOfferRuleList[i].operators;
					this.isActivity = false;
					this.isTag = true;
				}else{
					return false
				}
			}
		}
		for (i=0; i<this.activityRuleList.length; i++) {
			if (this.activityRuleList[i].attributeName == selectedAttribute) {
				if (!this.isActivityDisable) {
					this.activeValuesList = this.activityRuleList[i].values;
					this.activeOperatorsList = this.activityRuleList[i].operators;
					this.isActivity = true;
					this.isTag = false;
				}else{
					return false
				}
			}
		}
		return true;
	},
	setSelectedRuleList: function () {
		var uid = ((new Date()).getTime() + "" + Math.floor(Math.random() *1000000)).substr(0, 18);
		if (this.isActivity) {
			if (this.tagCount > 0) {
				this.isTagDisable = true;
			};
			this.activityCount = this.activityCount+1;
		}else if (this.isTag) {
			if (this.activityCount > 0) {
				this.isActivityDisable = true;
			};
			this.tagCount = this.tagCount+1;
		};
		this.selectedRuleList[this.rowCount] = {
			connector: this.selectedRule.connector,
			attribute: this.selectedRule.attribute,
			operator: this.selectedRule.operator,
			values: this.selectedRule.values,
			isActivity: this.isActivity,
			isTag: this.isTag,
			uid: uid,
			isGrouped: false,
			isGroupStart: false,
			isGroupEnd: false,
			groupLevel: 0,
			groupMembers: null
		};
		this.selectedRuleList[this.rowCount].values=(this.selectedRuleList[this.rowCount].values).replace(/,/g,'|');
		this.rowCount = this.rowCount+1;
		this.resetSelectedData();
	},
	setSelectedRow: function (selectedrows) {
		this.selectedRows = selectedrows;
	},
	setEditLists: function (rownumber) {
		var i, operators='', values='', selectedRule='';
		this.editAttributesList='';
		this.editOperatorsList='';
		this.editValuesList='';
		if(rownumber || rownumber==0){
			selectedRule=csStudio.global.clone(this.selectedRuleList[parseInt(rownumber)]);
		}else{
			selectedRule=this.editRule;
		}
		if (selectedRule.isActivity) {
			for (i=0; i<this.activityRuleList.length; i++) {
				this.editAttributesList = (this.editAttributesList=='')?this.activityRuleList[i].attributeName:this.editAttributesList+','+this.activityRuleList[i].attributeName;
				if (this.activityRuleList[i].attributeName == selectedRule.attribute) {
					this.editOperatorsList = this.activityRuleList[i].operators;
					this.editValuesList = this.activityRuleList[i].values;
				}
			}
		}else if (selectedRule.isTag) {
			for (i=0; i<this.applicableOfferRuleList.length; i++) {
				this.editAttributesList = (this.editAttributesList=='')?this.applicableOfferRuleList[i].attributeName:this.editAttributesList+','+this.applicableOfferRuleList[i].attributeName;
				if (this.applicableOfferRuleList[i].attributeName == selectedRule.attribute) {
					this.editOperatorsList = this.applicableOfferRuleList[i].operators;
					this.editValuesList = this.applicableOfferRuleList[i].values;
				}
			}
		}
		this.editAttributesList=(this.editAttributesList).split(',');
		this.editOperatorsList=(this.editOperatorsList).slice(1,-1).split(', ');
		this.editValuesList=(this.editValuesList).slice(1,-1).split(', ');
		this.editRule=selectedRule;
	},
	resetSelectedData: function () {
		this.selectedRule.attribute= '';
		this.selectedRule.operator= '';
		this.selectedRule.values= '';
		this.selectedRule.connector= '';
	},
	createRule: function (ruleType) {
		var rule='', rulelist = this.selectedRuleList, i;
		for (i=0;i<rulelist.length;i++) {
			if (rulelist[i][ruleType]) {
				rule = (rule != '') ? rule + rulelist[i].connector: '';
				rule = (rulelist[i].isGroupStart) ? rule + this.getParanthesis('open',rulelist[i].groupLevel): rule;
				rule = rule + ' (' + rulelist[i].attribute + ' ' + rulelist[i].operator + ' ' + rulelist[i].values + ') ';
				rule = (rulelist[i].isGroupEnd) ? rule + this.getParanthesis('close',rulelist[i].groupLevel): rule;
			}
		}
		return rule;
	},
	deleteSelectedRows: function () {
		var selectedrows = (this.selectedRows).split(',').sort(function (a,b) {return b-a}), i, uidList=[], listlength=0;
		if (selectedrows != '') {
			for (i=0;i<selectedrows.length;i++) {
				if (this.selectedRuleList[selectedrows[i]].isActivity) {
					this.activityCount = this.activityCount-1;
				}else if (this.selectedRuleList[selectedrows[i]].isTag) {
					this.tagCount = this.tagCount-1;
				}
				(this.selectedRuleList).splice(selectedrows[i],1);
				this.rowCount = this.rowCount-1;
			}
			if (this.rowCount > 0) {			
				if ((this.selectedRuleList[this.selectedRuleList.length-1].isTag  && this.activityCount == 0) || (this.selectedRuleList[this.selectedRuleList.length-1].isActivity && this.tagCount == 0)) {
					this.isActivityDisable = false;
					this.isTagDisable = false;
				}
			}else{
				this.isActivityDisable = false;
				this.isTagDisable = false;
			}
		}else{
			//selected rows empty!!!!!!
		}
		this.selectedRows = '';
		this.updateValidRuleConnector();
	},
	updateValidRuleConnector: function() {
		var i;
		for(i=0; i<this.selectedRuleList.length;i++){
			if(i==0 && this.selectedRuleList[i].connector=='Or'){
				this.selectedRuleList[i].connector='And';
			}else if( (i != 0)  && 
				(((this.selectedRuleList[i-1].isActivity && this.selectedRuleList[i].isTag) || (this.selectedRuleList[i].isActivity && this.selectedRuleList[i-1].isTag)) && (this.selectedRuleList[i].connector == 'Or')))
			{
					this.selectedRuleList[i].connector="And";
			}
		}
	},
	groupSelectedRows: function () {
		var selectedrows = (this.selectedRows).split(',').sort(function (a,b) {return a-b}), i, groupOpen=true, groupLead, groupMembers=''; 
		if (selectedrows != '') {
			for (i=0;i<selectedrows.length;i++) {
				this.selectedRuleList[selectedrows[i]].isGrouped = true;
				groupMembers = (groupMembers != '')?groupMembers +','+ selectedrows[i]:selectedrows[i];
				if (groupOpen) {
					this.selectedRuleList[selectedrows[i]].isGroupStart=true;
					groupOpen = false;
					groupLead = selectedrows[i];
					groupMembers = selectedrows[i];
					this.selectedRuleList[selectedrows[i]].groupLevel = parseInt(this.selectedRuleList[selectedrows[i]].groupLevel) + 1;
				}else if ((parseInt(selectedrows[i])+1 != parseInt(selectedrows[i+1])) || (this.selectedRuleList[selectedrows[i]].isActivity && this.selectedRuleList[selectedrows[i+1]].isTag) || (this.selectedRuleList[selectedrows[i+1]].isActivity && this.selectedRuleList[selectedrows[i]].isTag)) {
					this.selectedRuleList[selectedrows[i]].isGroupEnd=true;
					this.selectedRuleList[groupLead].groupMembers=groupMembers;
					this.selectedRuleList[selectedrows[i]].groupLevel = parseInt(this.selectedRuleList[selectedrows[i]].groupLevel) + 1;
					groupOpen=true;
				}
			}
		}else{
			//selected rows empty!!!!
		}
		this.selectedRows = '';
	},
	unGroupSelectedRows: function () {
		var selectedrows = (this.selectedRows).split(',').sort(function (a,b) {return a-b}), i;
		if (selectedrows != '') {
			for (i=0;i<selectedrows.length;i++) {
				this.selectedRuleList[selectedrows[i]].isGroupStart=false;
				this.selectedRuleList[selectedrows[i]].isGrouped = false;
				this.selectedRuleList[selectedrows[i]].isGroupEnd=false;
				this.selectedRuleList[selectedrows[i]].groupLevel=0;
				this.selectedRuleList[selectedrows[i]].groupMembers=null;
			}
		}else{
			//selected rows empty!!!!
		}
		this.selectedRows = '';
	},
	updateEditRow: function (rownumber) {
		this.selectedRuleList[rownumber].connector=this.editRule.connector;
		this.selectedRuleList[rownumber].attribute=this.editRule.attribute;
		this.selectedRuleList[rownumber].operator=this.editRule.operator;
		this.selectedRuleList[rownumber].values=this.editRule.values;
	},
	convertToXML: function () {
		//Rule Generation Start!
		var ruleList= this.selectedRuleList,i, ruleXML='', activityStart=false, tagStart=false;;
		ruleXML = "<ruleset>";
		ruleXML = ruleXML + '<timeperiod>'+this.selectedRule.period+'</timeperiod>';
		for (i=0;i<ruleList.length;i++) {
			if (ruleList[i].isActivity) {
				if (!activityStart) {
					ruleXML = ruleXML+"<activityrule>";
					activityStart=true;
				}
				ruleXML = ruleXML+"<rule>";
				ruleXML = ruleXML+"<connector>"+ruleList[i].connector+"</connector>";
				ruleXML = ruleXML+"<attribute>"+ruleList[i].attribute+"</attribute>";
				ruleXML = ruleXML+"<operator>"+csStudio.global.modifyOperator(ruleList[i].operator)+"</operator>";
				ruleXML = ruleXML+"<values>"+ruleList[i].values+"</values>";
				ruleXML = ruleXML+"<isGrouped>"+ruleList[i].isGrouped+"</isGrouped>";
				ruleXML = ruleXML+"<groupLevel>"+ruleList[i].groupLevel+"</groupLevel>";
				ruleXML = ruleXML+"<groupMembers>"+ruleList[i].groupMembers+"</groupMembers>";
				ruleXML = ruleXML+"<isGroupStart>"+ruleList[i].isGroupStart+"</isGroupStart>";
				ruleXML = ruleXML+"<isGroupEnd>"+ruleList[i].isGroupEnd+"</isGroupEnd>";
				ruleXML = ruleXML+"</rule>";
				if (((i+1)==ruleList.length) || ruleList[i+1].isTag) {
					ruleXML = ruleXML+"</activityrule>"
				}
			}else if (ruleList[i].isTag) {
				if (!tagStart) {
					ruleXML = ruleXML+"<tagrule>";
					tagStart=true;
				}
				ruleXML = ruleXML+"<rule>";
				ruleXML = ruleXML+"<connector>"+ruleList[i].connector+"</connector>";
				ruleXML = ruleXML+"<attribute>"+ruleList[i].attribute+"</attribute>";
				ruleXML = ruleXML+"<operator>"+csStudio.global.modifyOperator(ruleList[i].operator)+"</operator>";
				ruleXML = ruleXML+"<values>"+ruleList[i].values+"</values>";
				ruleXML = ruleXML+"<isGrouped>"+ruleList[i].isGrouped+"</isGrouped>";
				ruleXML = ruleXML+"<groupLevel>"+ruleList[i].groupLevel+"</groupLevel>";
				ruleXML = ruleXML+"<groupMembers>"+ruleList[i].groupMembers+"</groupMembers>";
				ruleXML = ruleXML+"<isGroupStart>"+ruleList[i].isGroupStart+"</isGroupStart>";
				ruleXML = ruleXML+"<isGroupEnd>"+ruleList[i].isGroupEnd+"</isGroupEnd>";
				ruleXML = ruleXML+"</rule>";
				if (((i+1)==ruleList.length) || ruleList[i+1].isActivity) {
					ruleXML = ruleXML+"</tagrule>";
				}
			}
		}
		ruleXML=ruleXML+"</ruleset>";
		this.ruleXML=ruleXML;
	},
	convertFromXML: function (ruleXML) {
		var ruleXML=csStudio.global.loadXMLString(ruleXML).childNodes[0],i,j,ruleList=[],rowcount=0, activityCount=0, tagCount=0,
			isActivity=false, isTag=false, isActivityDisable=false, isTagDisable=false;
		
		for (i=0;i<ruleXML.childNodes.length;i++) {
			if (ruleXML.childNodes[i].nodeName == 'timeperiod') {
				this.setSelectedRule({period:ruleXML.childNodes[i].childNodes[0].nodeValue});
			}else if (ruleXML.childNodes[i].nodeName == 'activityrule') {
				for (j=0;j<ruleXML.childNodes[i].childNodes.length;j++) {
					ruleList[rowcount]={
						connector: ruleXML.childNodes[i].childNodes[j].getElementsByTagName('connector')[0].childNodes[0].nodeValue,
						attribute: ruleXML.childNodes[i].childNodes[j].getElementsByTagName('attribute')[0].childNodes[0].nodeValue,
						operator: ruleXML.childNodes[i].childNodes[j].getElementsByTagName('operator')[0].childNodes[0].nodeValue,
						values: ruleXML.childNodes[i].childNodes[j].getElementsByTagName('values')[0].childNodes[0].nodeValue,
						isActivity: true,
						isTag: false,
						isGrouped: (ruleXML.childNodes[i].childNodes[j].getElementsByTagName('isGrouped')[0].childNodes[0].nodeValue).bool(),
						groupLevel: ruleXML.childNodes[i].childNodes[j].getElementsByTagName('groupLevel')[0].childNodes[0].nodeValue,
						groupMembers: ruleXML.childNodes[i].childNodes[j].getElementsByTagName('groupMembers')[0].childNodes[0].nodeValue,
						isGroupStart: (ruleXML.childNodes[i].childNodes[j].getElementsByTagName('isGroupStart')[0].childNodes[0].nodeValue).bool(),
						isGroupEnd: (ruleXML.childNodes[i].childNodes[j].getElementsByTagName('isGroupEnd')[0].childNodes[0].nodeValue).bool()
					}
					activityCount=activityCount+1;
					rowcount=rowcount+1;
					isActivity=true;
					isTag=false;
					if (tagCount > 0) {
						isTagDisable = true;
					};
				}
			}else if (ruleXML.childNodes[i].nodeName == 'tagrule') {
				for (j=0;j<ruleXML.childNodes[i].childNodes.length;j++) {
					ruleList[rowcount]={
						connector: ruleXML.childNodes[i].childNodes[j].getElementsByTagName('connector')[0].childNodes[0].nodeValue,
						attribute: ruleXML.childNodes[i].childNodes[j].getElementsByTagName('attribute')[0].childNodes[0].nodeValue,
						operator: ruleXML.childNodes[i].childNodes[j].getElementsByTagName('operator')[0].childNodes[0].nodeValue,
						values: ruleXML.childNodes[i].childNodes[j].getElementsByTagName('values')[0].childNodes[0].nodeValue,
						isActivity: false,
						isTag: true,
						isGrouped: (ruleXML.childNodes[i].childNodes[j].getElementsByTagName('isGrouped')[0].childNodes[0].nodeValue).bool(),
						groupLevel: ruleXML.childNodes[i].childNodes[j].getElementsByTagName('groupLevel')[0].childNodes[0].nodeValue,
						groupMembers: ruleXML.childNodes[i].childNodes[j].getElementsByTagName('groupMembers')[0].childNodes[0].nodeValue,
						isGroupStart: (ruleXML.childNodes[i].childNodes[j].getElementsByTagName('isGroupStart')[0].childNodes[0].nodeValue).bool(),
						isGroupEnd: (ruleXML.childNodes[i].childNodes[j].getElementsByTagName('isGroupEnd')[0].childNodes[0].nodeValue).bool()
					}
					rowcount=rowcount+1;
					tagCount=tagCount+1;
					isTag=true;
					isActivity=false;
					if (activityCount > 0) {
						isActivityDisable = true;
					}
				}
			}
		}
		this.selectedRuleList = ruleList;
		this.rowCount = rowcount;
		this.activityCount = activityCount;
		this.tagCount = tagCount;
		this.isActivity=isActivity;
		this.isTag=isTag;
		this.isActivityDisable=isActivityDisable;
		this.isTagDisable=isTagDisable;
	},
	resetData: function (){
		this.isActivity = false;
		this.isTag = false;
		this.isActivityDisable = false;
		this.isTagDisable = false;
		
		/* User selected List of rows with attribute; Operator & values */
		this.selectedRuleList = [];
		
		/* Number of rows created in total & as individual */
		this.rowCount = 0;
		this.activityCount = 0;
		this.tagCount = 0;
		this.selectedRows = '';
		this.ruleXML = '';
		
		this.selectedRule = {
			period: '',
			attribute: '',
			operator: '',
			values: '',
			connector: ''
		};
	}
};
csStudio.rule.decision.methods = {
	selectedObjective: {
		value:'',
		status:false,
		getValue: function(){
			return this.value
		},
		setValue: function(value){
			this.value = value;
		},
		clearValue: function(){
			this.value = '';
		}
	},
	createValueTree: function(values, parentposition, childposition, basevalue){
		var currentkey, returnvalue='', parentkey;
		/*
		The following is the sample structure of the valuetree. 
		createValueTree() and mergeValueTree() together brings the below structure.
		--------------------------------------------------------------------------------------------
			valuetree = [{
				key: "Consumer",
				parentkey: "Consumer",
				value:"Consumer:Acquistion:PP Account Signup,Consumer:Acquistion:PP Account Upgrade,Consumer:Activation:PP Account Activation, Consumer:Engagement/Usage:Loyalty",
				child:[
					{
						key:"Acquistion",
						value:"Consumer:Acquistion:PP Account Signup,Consumer:Acquistion:PP Account Upgrade,Consumer:Activation:PP Account Activation",
						child:[
							{
								key:"PP Account Signup",
								value:"Consumer:Acquistion:PP Account Signup"
							},
							{
								key:"PP Account Upgrade",
								value:"Consumer:Acquistion:PP Account Upgrade"
							},
							{
								key:"PP Account Activation",
								value:"Consumer:Activation:PP Account Activation"
							}
						]
					},
					{
						key:"EngagementUsage",
						value:"Consumer:Engagement/Usage:Loyalty"
					}
				]
			}];
		*/
		if(typeof(values[parentposition]) != "function"){
			parentkey = basevalue.split(':').splice(0,childposition+1).join(':');
			if(values[parentposition].indexOf(':') != -1){
				currentkey = values[parentposition].slice(0,values[parentposition].indexOf(':'));
				values[parentposition]=values[parentposition].slice(values[parentposition].indexOf(':')+1, values[parentposition].length);
				
				returnvalue={
					key: currentkey,
					parentkey: parentkey,
					value: basevalue,
					child: [this.createValueTree(values, parentposition, childposition+1, basevalue)]
				};
				return returnvalue;
			}else{
				returnvalue={
					key: values[parentposition],
					parentkey: parentkey,
					value: basevalue
				};
				return returnvalue;
			}
		}
	},
	mergeValueTree: function(temp){
		var x=0;
		
		while(temp[x+1]){
			if(temp[x].key == temp[parseInt(x)+1].key){
				if(temp[x].child){
					temp[x].child.push(temp[parseInt(x)+1].child[0]);
				}else{
					temp[x].child = [temp[parseInt(x)+1].child[0]];
				}
				temp[x].value = temp[x].value +","+temp[parseInt(x)+1].value;
				temp.splice(parseInt(x)+1,1);
			}else{
				if(temp[parseInt(x)].child){
					temp[parseInt(x)].child = this.mergeValueTree(temp[parseInt(x)].child);
				}
				x+=1;
			}
		}
		if(temp[parseInt(x)].child){
			temp[parseInt(x)].child = this.mergeValueTree(temp[parseInt(x)].child);
		}
		return temp;
	},
	getValueTree: function(valuetree, inputtype, valuefieldparam, selectedValues, branchStatus){
		var returnvalue='<ul class="rule-value-tree">', x, ifSelected='', tempSelectedValues = selectedValues || '', tempValuetree, i, j, _tempSelectedValues, _tempValuetree, _branchStatus = branchStatus || '';
		
		for(x=0; x<valuetree.length;x++){
			if(valuetree[x]){
				tempValuetree = (valuetree[x].parentkey).replace(/,/g,'|');
				ifSelected = ((tempSelectedValues).search(tempValuetree) != -1)?"checked=checked":'';
				if(valuetree[x].child){
					if(inputtype == "radio"){
						returnvalue=returnvalue+'<li class="'+((ifSelected!='')?'expand':_branchStatus)+'"><a href="javascript:void(0)" class="aplus" rel="expand" onclick="csStudio.rule.decision.methods.showtree(this)"><img src="images/plus_icon.gif" border="0"/></a><a href="javascript:void(0)" class="aminus" rel="collapse" onclick="csStudio.rule.decision.methods.hidetree(this)"><img src="images/minus_icon.gif" border="0"/></a><label><input type="'+inputtype+'" name="'+valuefieldparam.name+'" id="'+valuefieldparam.id+'" value="'+valuetree[x].parentkey+'" onclick="'+valuefieldparam.actionclickmethod+'" '+ifSelected+'/>'+valuetree[x].key+'</label>';
					}else if(inputtype == "checkbox") {
						returnvalue=returnvalue+'<li class="'+((ifSelected!='')?'expand':_branchStatus)+'"><a href="javascript:void(0)" class="aplus" rel="expand" onclick="csStudio.rule.decision.methods.showtree(this)"><img src="images/plus_icon.gif" border="0"/></a><a href="javascript:void(0)" class="aminus" rel="collapse" onclick="csStudio.rule.decision.methods.hidetree(this)"><img src="images/minus_icon.gif" border="0"/></a><label><input type="'+inputtype+'" name="'+valuefieldparam.name+'" id="'+valuefieldparam.id+'" value="'+valuetree[x].parentkey+'" onclick="'+valuefieldparam.actionclickmethod+'" '+ifSelected+'/>'+valuetree[x].key+'</label>';
					}else if(inputtype == "link"){
						returnvalue=returnvalue+'<li class="'+((ifSelected!='')?'expand':_branchStatus)+'"><a href="javascript:void(0)" class="aplus" rel="expand" onclick="csStudio.rule.decision.methods.showtree(this)"><img src="images/plus_icon.gif" border="0"/></a><a href="javascript:void(0)" class="aminus" rel="collapse" onclick="csStudio.rule.decision.methods.hidetree(this)"><img src="images/minus_icon.gif" border="0"/></a><label '+((ifSelected!='')?'class="selected"':'')+'><a href="javascript:void(0)" rel="'+valuetree[x].parentkey+'" onclick="'+valuefieldparam.linkmethod+'">'+valuetree[x].key+'</a></label>';
					}
					returnvalue=returnvalue+this.getValueTree(valuetree[x].child, inputtype, valuefieldparam, selectedValues, branchStatus);
					returnvalue=returnvalue+'</li>';
				}else{
					if (inputtype == "link") {
						returnvalue=returnvalue+'<li><label '+((ifSelected!='')?'class="selected"':'')+'><a href="javascript:void(0)" rel="'+valuetree[x].parentkey+'" onclick="'+valuefieldparam.linkmethod+'">'+valuetree[x].key+'</a></label>';
					}else{
						returnvalue=returnvalue+'<li class="lastchild"><label><input type="'+inputtype+'" name="'+valuefieldparam.name+'" id="'+valuefieldparam.id+'" value="'+valuetree[x].parentkey+'" onclick="'+valuefieldparam.actionclickmethod+'" '+ifSelected+'/>'+valuetree[x].key+'</label></li>';
					}
				}
			}
		}
		returnvalue=returnvalue+'</ul>';
		return returnvalue;
	},
	showtree: function (element){
		var ullist = YAHOO.util.Dom.getChildren(element.parentNode), x;
					
		for(x=0;x<ullist.length; x++){
			if(ullist[x].nodeName){
				if(ullist[x].nodeName === 'A' && ullist[x].getAttribute('rel') === 'collapse'){
					ullist[x].style.display = 'inline';
				}else if(ullist[x].nodeName === 'A' && ullist[x].getAttribute('rel') === 'expand'){
					ullist[x].style.display = 'none';
				}
				if(ullist[x].nodeName === 'UL'){
					ullist[x].style.display = 'block';
				}
			}
		}
	},
	hidetree: function (element){
		var ullist = YAHOO.util.Dom.getChildren(element.parentNode), x;
		
			for(x=0;x<ullist.length; x++){
				if(ullist[x].nodeName){
					if(ullist[x].nodeName === 'A' && ullist[x].getAttribute('rel') === 'collapse'){
						ullist[x].style.display = 'none';
					}else if(ullist[x].nodeName === 'A' && ullist[x].getAttribute('rel') === 'expand'){
						ullist[x].style.display = 'inline';
					}
					if(ullist[x].nodeName === 'UL'){
						ullist[x].style.display = 'none';
					}
				}
			}
	},
	selectChildCheckboxes: function (element){
		var checkboxlist = element.parentNode.parentNode.getElementsByTagName('input'), data = csStudio.rule.decision.data, selectedRule='', selectedValue = data.getSelectedValues() || '', x;
		
		if(checkboxlist.length > 0){
			for(x=0;x<checkboxlist.length; x++){
				if(checkboxlist[x].nodeName && checkboxlist[x].nodeName == 'INPUT' && checkboxlist[x].type == 'checkbox' && checkboxlist[x] != element){
					if(element.checked && checkboxlist[x].checked){
						selectedValue = selectedValue.replace(checkboxlist[x].value+",", "");
						selectedValue = selectedValue.replace(","+checkboxlist[x].value, "");
						selectedValue = selectedValue.replace(checkboxlist[x].value, "");
						selectedRule = {
							values: selectedValue
						};
						data.setSelectedRule(selectedRule);
					}
					checkboxlist[x].checked = (element.checked)?true:false;
				}
			}
		}
		if(element.type=="checkbox"){
			this.selectParentCheckboxes(element);
		}
	},
	selectParentCheckboxes: function(element){
		var checkboxlist = document.studioform[element.getAttribute('name')], i, isParent=false, isChild=false, isSiblingsChecked=false;
		
		if(element.type=="checkbox"){
			for(i=(checkboxlist.length-1);i>=0;i--){
				isParent = ((element.value).search(checkboxlist[i].value) !=-1)?true:false;
				isChild = ((checkboxlist[i].value).search(element.value) !=-1)?true:false;
				if(isParent && element.checked){
					checkboxlist[i].checked=true;
				}else if((!isChild) && isParent && (!element.checked)){
					isSiblingsChecked = this.checkSiblings(checkboxlist[i]);
					if(!isSiblingsChecked){
						checkboxlist[i].checked=false;
					}
				}
				if (isChild && (!element.checked)) {
					checkboxlist[i].checked=false;
				}
			}
		}
	},
	checkSiblings: function(element) {
		var childList = element.parentNode.parentNode.getElementsByTagName('input'), x;
		
		for(x=(childList.length-1);x>=0; x--){
			if(childList[x].nodeName && childList[x].nodeName == 'INPUT' && childList[x].type == 'checkbox' && childList[x] != element){
				if(childList[x].checked){
					return true;
				}
			}
		}
		return false;
	},
	loadRule: function (ruleCoded) {
		var target = {
			target: {
				targetContainer:'container',
				targetPreview:'preview',
				targetError:'failure'
			},
			enable: {
				save: 'rule-save',
				deletebutton: 'rule-delete',
				group: 'rule-group',
				ungroup: 'rule-ungroup'
			}
		}, data = csStudio.rule.decision.data, that=csStudio.rule.decision.create, ruleXML, validate = csStudio.rule.decision.validate;
		ruleXML = document.getElementById(ruleCoded).value;
		if (ruleXML!='') {
			data.convertFromXML(ruleXML);
			document.getElementById(target.target.targetContainer).innerHTML = that.generateRow();
			document.getElementById(target.target.targetPreview).innerHTML = data.getPreviewRuleContent();
			validate.canEnableSave(data,target.enable);
			validate.canEnableDelete(data,target.enable);
			validate.canEnableGroup(data,target.enable);
		}
	},
	resetRowFields: function (object) {
		var data = csStudio.rule.decision.data,
			globalNS = csStudio.global;
			
		globalNS.listBoxUpdateSelectedIndex(object.connector,'Select');
		globalNS.listBoxUpdateSelectedIndex(object.attribute,'Select');
		globalNS.listBoxDataClear(object.operator);
		document.getElementById(object.value).innerHTML = '';
	},
	updateSelectedValue: function (element, data, updatetype) {
		var selectedRule={}, selectedValue = '', tempselectedValue, i;
		
		if (updatetype == 'edit') {
			selectedValue =  data.getEditValues();
		}else{
			selectedValue = data.getSelectedValues();
		}
		tempselectedValue = selectedValue.split('|');
		
		this.selectParentCheckboxes(element);
		
		if (element.type == 'text' || element.type == 'radio') {
			tempselectedValue = element.value;
		}else if (element.type == 'checkbox' && element.checked) {
			if (selectedValue != '') {
				for(i=tempselectedValue.length-1;i>=0;i--){
					if( (element.value).search(tempselectedValue[i]) != -1 ) {
						tempselectedValue.splice(i,1);
					}
				}
				tempselectedValue.push(element.value);
			}else{
				tempselectedValue = element.value;
			}
		}else if (element.type == 'checkbox' && !(element.checked)) {
			for(i=tempselectedValue.length-1;i>=0;i--){
				if( ((element.value).search(tempselectedValue[i]) != -1) ||
					((tempselectedValue[i]).search(element.value) != -1)
					) {
					tempselectedValue.splice(i,1);
				}
			}
		}
		if(csStudio.global.validation.isArray(tempselectedValue)){
			selectedValue = tempselectedValue.join('|');
		} else {
			selectedValue = tempselectedValue;
		}
		selectedRule = {
			values: selectedValue
		};
		if (updatetype == 'edit') {
			data.setEditRule(selectedRule);
		} else {
			data.setSelectedRule(selectedRule);
		}
	},
	selectObjective: function(element, target){
		var selectedValue = this.selectedObjective.getValue() || document.getElementById(target).value, lightbox, elementList, i;
		
		if (element.type == 'text' || element.type == 'radio') {
			selectedValue = element.value;
		}else if (element.type == 'checkbox' && element.checked) {
			if (selectedValue != '') {
				selectedValue = selectedValue + "," +element.value;
			}else{
				selectedValue = element.value;
			}
		}else if (element.type == 'checkbox' && !(element.checked)) {
			elementList = (element.value).split(',');
			for(i=0;i<elementList.length;i++){
				selectedValue = selectedValue.replace(elementList[i]+",", "");
				selectedValue = selectedValue.replace(","+elementList[i], "");
				selectedValue = selectedValue.replace(elementList[i], "");
			}
		}
		
		this.selectedObjective.setValue(selectedValue);
		this.selectedObjective.status = true;
		lightbox = document.getElementById('csLightbox');
		this.selectChildCheckboxes(element);
	},
	selectObjectiveLink: function(element, target){
		document.getElementById(target).value = element.getAttribute('rel');
		csStudio.global.hideLightBox('csLightbox', true);
	},
	copyObjective: function(target) {
		var datavar = this.selectedObjective, valueemptychk;
		if(datavar.status){
			if (datavar.getValue() != '') {
				document.getElementById(target).value = datavar.getValue();
			} else if(datavar.getValue() == '') {
				valueemptychk = confirm("No Objective Selected! Do you want to Save?");
				if (valueemptychk) {
					document.getElementById(target).value = datavar.getValue();
				}
			}
			this.selectedObjective.status = false;
		}
		csStudio.global.hideLightBox('csLightbox', true);
	}
};
csStudio.rule.decision.create = {
	onChangePeriod: function (e, obj) {
		var data = csStudio.rule.decision.data, selectedRule={};
		document.getElementById(obj.target).value = this.value;
		selectedRule.period=this.value;
		data.setSelectedRule(selectedRule);
		if (data.selectedRuleList.length >0) {
			document.getElementById(obj.targetPreview).innerHTML = data.getPreviewRuleContent();
		}
	},
	onChangeConnector: function (e, obj) {
		var data = csStudio.rule.decision.data, selectedRule={}, validate=csStudio.rule.decision.validate;
		selectedRule.connector=this.value;
		validate.hideError(obj);
		data.setSelectedRule(selectedRule);
	},
	onChangeAttribute: function (e, obj) {
		var operators = '', data=csStudio.rule.decision.data,
			status = '', validate=csStudio.rule.decision.validate, selectedRule, globalNS = csStudio.global;
		
		selectedRule = {
			attribute: this.value,
			operator: '',
			values: ''
		};
		data.setSelectedRule(selectedRule);
		status = data.setActiveOperatorsAndValuesList(this.value);
		if (!status) {
			validate.showError(obj.targetError, 'RULE_SWAP_ERR_MSG');
			globalNS.listBoxUpdateSelectedIndex(this.getAttribute('id'), 'Select');
			globalNS.listBoxDataFill(obj.target, "");
			document.getElementById(obj.targetValueContainer).innerHTML = '';
			return false;
		}else{
			validate.hideError(obj);
		}
		if(this.value){
			operators = (data.getActiveOperatorsList()).slice(1,-1).split(', ');
			csStudio.global.listBoxDataFill(obj.target, operators);
		}else{
			csStudio.global.listBoxDataClear(obj.target);
		}
		document.getElementById(obj.targetValueContainer).innerHTML = '';
	},
	onChangeOperator: function (e, obj) {
		var data=csStudio.rule.decision.data, selectedRule = '', that = csStudio.rule.decision.create,
			values = (data.getActiveValuesList()).slice(1,-1).split(', '), methods = csStudio.rule.decision.methods, validate=csStudio.rule.decision.validate,
			valueBlock = document.getElementById(obj.target), valuecontent = '', i, inputtype, valuetree = new Array(), defaultBranchStatus='collapse';
		if (this.value) {
			validate.hideError(obj);
			if (values == '' && this.value) {
				valuecontent = '<input type="text" id="rule-value-field" name="rule-value-field" value="" onblur="csStudio.rule.decision.methods.updateSelectedValue(this, csStudio.rule.decision.data, \'create\')" onkeypress="return csStudio.global.validation.numbersOnly(event)" />';
			}else{
				inputtype =  (this.value == '=')?'radio':(this.value == 'in' || this.value == 'not_in')?'checkbox':'text';
				
				valuefieldparam = {
					id: 'rule-value-field',
					name: 'rule-value-field',
					actionblurmethod: 'csStudio.rule.decision.methods.updateSelectedValue(this, csStudio.rule.decision.data, \'create\')',
					actionclickmethod: 'csStudio.rule.decision.methods.updateSelectedValue(this, csStudio.rule.decision.data, \'create\')'
				};
				
				values = values.sort();
				for(x in values){
					valuetree[x] = methods.createValueTree(values,x,0,values[x]);
				}
				valuetree = methods.mergeValueTree(valuetree);
				valuecontent = methods.getValueTree(valuetree, inputtype, valuefieldparam, '', defaultBranchStatus);
			}
		}
		selectedRule = {
			operator: this.value,
			values: ''
		}
		data.setSelectedRule(selectedRule);
		valueBlock.innerHTML = valuecontent;
	},
	addRow: function (e, obj) {
		var ruleList, isValidateSuccess, container=document.getElementById(obj.target.targetContainer),
			that = csStudio.rule.decision.create,
			methods = csStudio.rule.decision.methods,
			data = csStudio.rule.decision.data,
			validate = csStudio.rule.decision.validate, selectedRule;
		
		if (!(((data.activityCount == 0 && data.isActivity) && (data.tagCount == 0 && data.isTag)) && (data.selectedRule.connector==''))) {
			selectedRule = {
				connector:document.getElementById(obj.target.targetConnector).value
			}
			data.setSelectedRule(selectedRule);
		}
		
		isValidateSuccess = validate.selectedFieldCheck(data, 'create');
		
		if (!isValidateSuccess.status) {
			validate.showError(obj.target.targetError, isValidateSuccess.message);
			return false;
		}else{
			document.getElementById(obj.target.targetError).style.display='none';
		}
		isValidateSuccess = validate.validateConnector(data);
		if (!isValidateSuccess) {
			validate.showError(obj.target.targetError, 'INVALID_CONNECTOR_ERR_MSG')
			return false;
		}else{
			document.getElementById(obj.target.targetError).style.display='none';
		}
		data.setSelectedRuleList()
		document.getElementById(obj.target.targetPreview).innerHTML = data.getPreviewRuleContent();
		container.innerHTML = that.generateRow();
		methods.resetRowFields(obj.reset);
		validate.canEnableSave(data,obj.enable);
		validate.canEnableDelete(data,obj.enable);
		validate.canEnableGroup(data,obj.enable);
	},
	deleteRow: function (e, obj) {
		var container=document.getElementById(obj.target.targetContainer),
			that = csStudio.rule.decision.create, methods = csStudio.rule.decision.methods, data = csStudio.rule.decision.data,
			validate = csStudio.rule.decision.validate, isValidateSuccess;
		
		isValidateSuccess = validate.canDeleteRows(data);
		if (!isValidateSuccess) {
			validate.showError(obj.target.targetError, 'DELETE_ROW_ERR_MSG');
			return false;
		}else{
			document.getElementById(obj.target.targetError).style.display='none';
		}
		data.deleteSelectedRows();
		
		document.getElementById(obj.target.targetPreview).innerHTML = data.getPreviewRuleContent();
		container.innerHTML = that.generateRow();
		methods.resetRowFields(obj.reset);
		validate.canEnableSave(data,obj.enable);
		validate.canEnableDelete(data,obj.enable);
		validate.canEnableGroup(data,obj.enable);
	},
	selectRow: function (event, obj) {
		var selectedrows = csStudio.rule.decision.data.getSelectedRow();
		if (obj.checked) {
			if (selectedrows == '') {
				selectedrows = obj.value;
			}else{
				selectedrows = selectedrows+','+obj.value;
			}
		}else{
			selectedrows = selectedrows.replace(obj.value+",", "");
			selectedrows = selectedrows.replace(","+obj.value, "");
			selectedrows = selectedrows.replace(obj.value, "");
		}
		csStudio.rule.decision.data.setSelectedRow(selectedrows);
	},
	groupRows: function (event, obj) {
		var validate = csStudio.rule.decision.validate, that=csStudio.rule.decision.create, isValidateSuccess=false, data = csStudio.rule.decision.data,
			container=document.getElementById(obj.target.targetContainer);
			
		if((data.selectedRows).split(',').length < 2){
			validate.showError(obj.target.targetError, 'GROUP_EMPTY_ROW_ERR_MSG');
			return false;
		}
		isValidateSuccess = validate.canGroupRow(data);
		if (!isValidateSuccess) {
			validate.showError(obj.target.targetError, 'GROUP_ROW_ERR_MSG');
			return false;
		}else{
			document.getElementById(obj.target.targetError).style.display='none';
			data.groupSelectedRows();
			
			container.innerHTML = that.generateRow();
			document.getElementById(obj.target.targetPreview).innerHTML = data.getPreviewRuleContent();
		}
	},
	unGroupRows: function (event, obj) {
		var validate = csStudio.rule.decision.validate, data = csStudio.rule.decision.data, isValidateSuccess=false, that=csStudio.rule.decision.create, container=document.getElementById(obj.target.targetContainer);
		
		isValidateSuccess = validate.canUnGroupRow(data);
		if (!isValidateSuccess) {
			validate.showError(obj.target.targetError, 'UNGROUP_ROW_ERR_MSG');
			return false;
		}else{
			document.getElementById(obj.target.targetError).style.display='none';
			data.unGroupSelectedRows();
			container.innerHTML = that.generateRow();
			document.getElementById(obj.target.targetPreview).innerHTML = data.getPreviewRuleContent();
		}
	},
	editRow: function (container,rownumber) {
		var data = csStudio.rule.decision.data, ruleList = data.getSelectedRuleList(), ruleContent='', selectedrows = data.getSelectedRow(), checked='', i,
			container=document.getElementById(container), globalNS = csStudio.global, editvaluescontent='', that=csStudio.rule.decision.create, methods=csStudio.rule.decision.methods, 
			inputtype, valuetree = new Array(), editValuesList, defaultBranchStatus='collapse';
		for (i=0;i<ruleList.length;i++) {
			if (i==rownumber) {
				checked = (selectedrows.search(i)>=0)?'checked="checked"':'';
				ruleContent = ruleContent + '<div style="width:100%;float:left; border-bottom:1px normal #cecece; padding:3px 0">';
				ruleContent = ruleContent + '<div style="float: left; width:15px;margin-right:10px;">';
				ruleContent = ruleContent + '<input type="checkbox" name="check'+i+'" id="check'+i+'" value="'+i+'" onclick="csStudio.rule.decision.create.selectRow(event, this)" '+checked+'/>';
				ruleContent = ruleContent + '</div>';
				ruleContent = ruleContent + '<div id="connector'+i+'" style="float: left; width:8%; margin-right:8px; text-align:middle">';
				ruleContent = ruleContent + '<select name="connector" id="rule-edit-connector" style="width:65px; font-size:10px;"><option value="" disabled>Select</option>'
				ruleContent = ruleContent + '</select></div><div id="attribute'+i+'" style="float: left; width:220px; margin-right:20px">';
				ruleContent = ruleContent + '<select name="attribute" id="rule-edit-attribute" style="width:auto; font-size:10px;"><option value="" disabled>Select</option></select></div>';
				ruleContent = ruleContent + '<div id="operator'+i+'" style="float: left; width:17%; _width:15%; margin-right:24px; text-align:center">';
				ruleContent = ruleContent + '<select name="operator" id="rule-edit-operator" style="width:auto; font-size:10px;"><option value="">Select</option></select></div>';
				ruleContent = ruleContent + '<div id="rule-edit-values'+i+'" style="float: left; width:330px; margin-right:10px; word-wrap: break-word;"></div>';
				ruleContent = ruleContent + '<div id="rule-editor-links'+i+'" style="float:left;"><a href="#ruleInterface" id="rule-editor-save-link'+i+'" >Save</a>&nbsp;&nbsp;<a href="#ruleInterface" onclick="csStudio.rule.decision.create.cancelEditRow()">Cancel</a></div>';
				ruleContent = ruleContent + '</div>';
			}else{
				checked = (selectedrows.search(i)>=0)?'checked="checked"':'';
				ruleContent = ruleContent + '<div style="width:100%;float:left; border-bottom:1px normal #cecece; padding:3px 0">';
				ruleContent = ruleContent + '<div style="float: left; width:15px;margin-right:10px;">';
				if ((ruleList[i].isGrouped && ruleList[i].isGroupStart) || (!ruleList[i].isGrouped)) {
					ruleContent = ruleContent + '<input type="checkbox" name="check'+i+'" id="check'+i+'" value="'+((ruleList[i].isGrouped)?ruleList[i].groupMembers:i)+'" onclick="csStudio.rule.decision.create.selectRow(event, this)" '+checked+'/>';
				}else if (ruleList[i].isGrouped) {
					ruleContent = ruleContent + '&nbsp;';
				}
				ruleContent = ruleContent + '</div>';
				ruleContent = ruleContent + '<div id="connector'+i+'" style="float: left; width:8%; margin-right:8px; text-align:middle">'+ruleList[i].connector+'</div>';
				ruleContent = ruleContent + '<div id="attribute'+i+'" style="float: left; width:220px; margin-right:20px">'+ruleList[i].attribute+'</div>';
				ruleContent = ruleContent + '<div id="operator'+i+'" style="float: left; width:17%; _width:15%; margin-right:24px; text-align:center">'+ruleList[i].operator+'</div>';
				ruleContent = ruleContent + '<div id="value'+i+'" style="float: left; width:330px; margin-right:15px; word-wrap: break-word;">'+ruleList[i].values+'</div>';
				ruleContent = ruleContent + '<span style="color:#cecece">Edit</span>';
				ruleContent = ruleContent + '</div>';
			}
		}
		container.innerHTML = ruleContent;
		methods.resetRowFields({connector:'rule-connector',attribute:'rule-attribute',operator:'rule-operator',value:'rule-values'});
		data.setEditLists(rownumber);
		globalNS.listBoxDataFill('rule-edit-connector', data.connectorList, ruleList[rownumber].connector);
		globalNS.listBoxDataFill('rule-edit-attribute', data.editAttributesList, ruleList[rownumber].attribute);
		globalNS.listBoxDataFill('rule-edit-operator', data.editOperatorsList, ruleList[rownumber].operator);
		if (data.editValuesList == '') {
			editvaluescontent='<input type="text" id="rule-edit-value-field" name="rule-edit-value-field" value="'+ruleList[rownumber].values+'" onkeypress="return csStudio.global.validation.numbersOnly(event)" onblur="csStudio.rule.decision.methods.updateSelectedValue(this, csStudio.rule.decision.data, \'edit\')" />';
		}else{
			inputtype =  (ruleList[rownumber].operator == '=')?'radio':(ruleList[rownumber].operator == 'in' || ruleList[rownumber].operator == 'not_in')?'checkbox':'text';
			
			valuefieldparam = {
				id: 'rule-edit-value-field',
				name: 'rule-edit-value-field',
				actionblurmethod: 'csStudio.rule.decision.methods.updateSelectedValue(this, csStudio.rule.decision.data, \'edit\')',
				actionclickmethod: 'csStudio.rule.decision.methods.updateSelectedValue(this, csStudio.rule.decision.data, \'edit\')'
			};
			editValuesList= csStudio.global.clone(data.editValuesList).sort();
			for(x in editValuesList){
				valuetree[x] = methods.createValueTree(editValuesList,x,0,editValuesList[x]);
			}
			valuetree = methods.mergeValueTree(valuetree);
			editvaluescontent= editvaluescontent + methods.getValueTree(valuetree, inputtype, valuefieldparam, ruleList[rownumber].values, defaultBranchStatus);
		}
		document.getElementById('rule-edit-values'+rownumber).innerHTML=editvaluescontent;
		that.disableAll();
		
		var onChangeEditAttributeParam = {targetOperator:'rule-edit-operator',targetValueContainer:'rule-edit-values',targetError:'failure',targetConnector:'rule-edit-connector',rowNumber:rownumber};
		YAHOO.util.Event.addListener("rule-edit-attribute", "change", csStudio.rule.decision.create.onChangeEditAttribute, onChangeEditAttributeParam);
		
		var onChangeEditOperatorParam = {targetValueContainer:'rule-edit-values',targetError:'failure',targetConnector:'rule-edit-connector',rowNumber:rownumber};
		YAHOO.util.Event.addListener("rule-edit-operator", "change", csStudio.rule.decision.create.onChangeEditOperator, onChangeEditOperatorParam);
		
		var onClickEditSaveParam = {
			target: {
				targetContainer:'container',
				targetPreview:'preview',
				targetError:'failure'
			},
			enable: {
				save: 'rule-save',
				deletebutton: 'rule-delete',
				group: 'rule-group',
				ungroup: 'rule-ungroup'
			},
			targetConnector:'rule-edit-connector',
			rownumber:rownumber
		};
		
		YAHOO.util.Event.addListener("rule-editor-save-link"+rownumber, "click", csStudio.rule.decision.create.saveEditRow, onClickEditSaveParam);
	},
	onChangeEditAttribute: function (event, obj) {
		var data = csStudio.rule.decision.data, globalNS = csStudio.global;
		
		data.editRule.attribute = this.value;
		data.setEditLists();
		data.editRule.operator = '';
		data.editRule.values = '';
		globalNS.listBoxDataFill(obj.targetOperator, data.editOperatorsList);
		document.getElementById(obj.targetValueContainer+obj.rowNumber).innerHTML='&nbsp;';
	},
	onChangeEditOperator: function (event, obj) {
		var data = csStudio.rule.decision.data, editvaluescontent='', i, valuetree=new Array(), methods=csStudio.rule.decision.methods, editValuesList, defaultBranchStatus='collapse';
		
		if (this.value) {
			data.editRule.operator = this.value;
			if (data.editValuesList == '') {
				editvaluescontent='<input type="text" id="rule-edit-value-field" name="rule-edit-value-field" value="" onblur="csStudio.rule.decision.methods.updateSelectedValue(this, csStudio.rule.decision.data, \'edit\')" onkeypress="return csStudio.global.validation.numbersOnly(event)" />';
			}else{
				inputtype =  (this.value == '=')?'radio':(this.value == 'in' || this.value == 'not_in')?'checkbox':'text';
				
				valuefieldparam = {
					id: 'rule-edit-value-field',
					name: 'rule-edit-value-field',
					actionblurmethod: 'csStudio.rule.decision.methods.updateSelectedValue(this, csStudio.rule.decision.data, \'edit\')',
					actionclickmethod: 'csStudio.rule.decision.methods.updateSelectedValue(this, csStudio.rule.decision.data, \'edit\')'
				};
				
				editValuesList = csStudio.global.clone(data.editValuesList).sort();
				for(x in editValuesList){
					valuetree[x] = methods.createValueTree(editValuesList,x,0,editValuesList[x]);
				}
				valuetree = methods.mergeValueTree(valuetree);
				editvaluescontent = methods.getValueTree(valuetree, inputtype, valuefieldparam, '', defaultBranchStatus);
			}
			document.getElementById(obj.targetValueContainer+obj.rowNumber).innerHTML=editvaluescontent;
			data.editRule.values = '';
		}else{
			data.editRule.operator = '';
			data.editRule.values = '';
			document.getElementById(obj.targetValueContainer+obj.rowNumber).innerHTML='&nbsp;';
		}
	},
	generateRow: function () {
		var data = csStudio.rule.decision.data, ruleList = data.getSelectedRuleList(), ruleContent='', 
			selectedrows = data.getSelectedRow(), checked='', i, groupStart=true;
		for (i=0;i<ruleList.length;i++) {
			checked = (selectedrows.search(i)>=0)?'checked="checked"':'';
			
			ruleContent = ruleContent + '<div style="width:100%;float:left; border-bottom:1px normal #cecece; padding:3px 0">';
			ruleContent = ruleContent + '<div style="float: left; width:15px;margin-right:10px;">';
			if ((ruleList[i].isGrouped && ruleList[i].isGroupStart && groupStart) || (!ruleList[i].isGrouped)) {
				ruleContent = ruleContent + '<input type="checkbox" name="check'+i+'" id="check'+i+'" value="'+((ruleList[i].isGrouped && ruleList[i].groupMembers != null)?ruleList[i].groupMembers:i)+'" onclick="csStudio.rule.decision.create.selectRow(event, this)" '+checked+'/>';
				groupStart = (ruleList[i].isGrouped && ruleList[i].isGroupStart)?false:true;
			}else if (ruleList[i].isGrouped) {
				ruleContent = ruleContent + '&nbsp;';
			}
			ruleContent = ruleContent + '</div>';
			ruleContent = ruleContent + '<div id="connector'+i+'" style="float: left; width:8%; margin-right:8px; text-align:middle">'+ruleList[i].connector+'</div>';
			ruleContent = ruleContent + '<div id="attribute'+i+'" style="float: left; width:220px; margin-right:20px">'+ruleList[i].attribute+'</div>';
			ruleContent = ruleContent + '<div id="operator'+i+'" style="float: left; width:17%; _width:15%; margin-right:24px; text-align:center">'+ruleList[i].operator+'</div>';
			ruleContent = ruleContent + '<div id="value'+i+'" style="float: left; width:330px; margin-right:15px; word-wrap: break-word;">'+(ruleList[i].values).replace(/\|/g, ', ')+'</div>';
			if (ruleList[i].isGrouped) {
				ruleContent = ruleContent + '<span style="color:#cecece">Edit</span>';
			}else{
				ruleContent = ruleContent + '<div id="editor'+i+'" style="float:left;"><a href="javascript:csStudio.rule.decision.create.editRow(\'container\','+i+');">Edit</a></div>';
			}
			ruleContent = ruleContent + '</div>';
			groupStart = (ruleList[i].isGrouped && ruleList[i].isGroupEnd || !ruleList[i].isGrouped)?true:false;
		}
		return ruleContent;
	},
	saveEditRow: function (e, obj) {
		var data = csStudio.rule.decision.data, that=csStudio.rule.decision.create, validate = csStudio.rule.decision.validate, 
		isValidateSuccess=false, connector, selectedRule;
		
		isValidateSuccess = validate.editRowCheck(data);
		if (!isValidateSuccess) {
			validate.showError(obj.target.targetError, 'EDIT_ROW_ERR_MSG');
			return false;
		}else{
			connector = document.getElementById(obj.targetConnector);
			isValidateSuccess = validate.validateEditConnector(data, connector.value, obj.rownumber);
			if (!isValidateSuccess) {
				validate.showError(obj.target.targetError, 'INVALID_CONNECTOR_ERR_MSG')
				return false;
			}else{
				selectedRule = {
					connector: connector.value
				};
				data.setEditRule(selectedRule);
				document.getElementById(obj.target.targetError).style.display='none';
				data.updateEditRow(obj.rownumber);
				document.getElementById(obj.target.targetPreview).innerHTML = data.getPreviewRuleContent();
				document.getElementById(obj.target.targetContainer).innerHTML = that.generateRow();
				that.enableAll();
				validate.canEnableSave(data,obj.enable);
				validate.canEnableDelete(data,obj.enable);
				validate.canEnableGroup(data,obj.enable);
			}
		}
	},
	disableAll: function () {
		var i, target = ['rule-connector','rule-attribute','rule-operator','rule-group','rule-ungroup','rule-delete','rule-save','rule-add-row'];
		for (i=0;i<target.length;i++) {
			document.getElementById(target[i]).disabled=true;
		}
	},
	enableAll: function () {
		var i, target = ['rule-connector','rule-attribute','rule-operator','rule-group','rule-ungroup','rule-delete','rule-save','rule-add-row'];
		for (i=0;i<target.length;i++) {
			document.getElementById(target[i]).disabled=false;
		}
	},
	cancelEditRow: function () {
		var data=csStudio.rule.decision.data, that=csStudio.rule.decision.create, editSaveParam={}, validate = csStudio.rule.decision.validate;
		editSaveParam = {
			target: {
				targetContainer:'container',
				targetPreview:'preview',
				targetError:'failure'
			},
			enable: {
				save: 'rule-save',
				deletebutton: 'rule-delete',
				group: 'rule-group',
				ungroup: 'rule-ungroup'
			}
		}
		data.editRule={};
		document.getElementById(editSaveParam.target.targetError).style.display='none';
		document.getElementById(editSaveParam.target.targetContainer).innerHTML = that.generateRow();
		that.enableAll();
		validate.canEnableSave(data,editSaveParam.enable);
		validate.canEnableDelete(data,editSaveParam.enable);
		validate.canEnableGroup(data,editSaveParam.enable);
	},
	setIntermediateRule: function (obj) {
		var data = csStudio.rule.decision.data;
		document.getElementById(obj.targetperiodfield).value = data.getSelectedPeriod();
		document.getElementById(obj.targetactivityfield).value = data.createRule('isActivity');
		document.getElementById(obj.targettagfield).value = data.createRule('isTag');
		document.getElementById(obj.targetrulecodedfield).value = data.getRuleXML();
	},
	saveRule: function (e, obj) {
		var studioform = document[obj.form],
			that = csStudio.rule.decision.create,
			validate = csStudio.rule.decision.validate;
		
		that.setIntermediateRule(obj);
		document.getElementById('cmd').value=obj.cmd;
		studioform.action=obj.targetAction;
		if (validate.canSubmitForm(obj)) {
			studioform.submit();
		}
	},
	cancelRuleAction: function () {
		window.location.href="createresponserule.htm"
	}
};
csStudio.rule.decision.search = {
	data: csStudio.global.clone(csStudio.rule.decision.data),
	searchResultList: {},
	searchResultCount: 0,
	onChangeConnector: function (e, obj) {
		var data = csStudio.rule.decision.search.data, selectedRule={};
		selectedRule.connector=this.value;
		data.setSelectedRule(selectedRule);
	},
	resetSearchResults: function(){
		this.searchResultList={};
		this.searchResultCount=0;
	},
	addToSearchResultList: function(id,rulename,rulecoded){
		this.searchResultList[this.searchResultCount] = {
			id: id,
			ruleName: rulename,
			ruleCoded: rulecoded
		}
		this.searchResultCount++
	},
	onChangeAttribute: function (e, obj) {
		var operators = '', data=csStudio.rule.decision.search.data,
			status = '', validate=csStudio.rule.decision.validate, globalNS = csStudio.global, selectedRule='';
			
		selectedRule = {
			attribute: this.value,
			operator: '',
			values: ''
		};
		data.setSelectedRule(selectedRule);
		status = data.setActiveOperatorsAndValuesList(this.value);
		if (!status) {
			alert(csStudio.rule.decision.ERROR.RULE_SWAP_ERR_ALERT);
			globalNS.listBoxUpdateSelectedIndex(this.getAttribute('id'), 'Select');
			globalNS.listBoxDataFill(obj.target, "");
			document.getElementById(obj.targetValueContainer).innerHTML = '';
			return false;
		}
		if(this.value){
			operators = (data.getActiveOperatorsList()).slice(1,-1).split(', ');
			csStudio.global.listBoxDataFill(obj.target, operators);
		}else{
			csStudio.global.listBoxDataClear(obj.target);
		}
		document.getElementById(obj.targetValueContainer).innerHTML = '<div style="width:200px">&nbsp;</div>';
	},
	onChangeOperator: function (e, obj) {
		var data=csStudio.rule.decision.search.data, selectedRule = '', that = csStudio.rule.decision.search,
			values = (data.getActiveValuesList()).slice(1,-1).split(', '), valuefieldparam,
			valueBlock = document.getElementById(obj.target);
		
		selectedRule = {
			operator: this.value,
			values: ''
		}
		data.setSelectedRule(selectedRule);
		valuefieldparam = {
			id: 'rule-value-field',
			name: 'rule-value-field',
			actionblurmethod: 'csStudio.rule.decision.methods.updateSelectedValue(this, csStudio.rule.decision.search.data, \'create\')',
			actionclickmethod: 'csStudio.rule.decision.methods.updateSelectedValue(this, csStudio.rule.decision.search.data, \'create\')'
		}
		if(this.value){
			valueBlock.innerHTML = that.getValuesContent(values, this.value, valuefieldparam);
		}else{
			valueBlock.innerHTML = '';
		}
	},
	getValuesContent: function (values, selectedoperator, valuefieldparam){
		var valuecontent = '', i, inputtype, that = csStudio.rule.decision.search, methods = csStudio.rule.decision.methods, valuetree=new Array(), defaultBranchStatus='collapse';
		
		if (values == '' && selectedoperator) {
			valuecontent = '<input type="text" id="'+valuefieldparam.id+'" name="'+valuefieldparam.name+'" value="" onblur="'+valuefieldparam.actionblurmethod+'" onkeypress="return csStudio.global.validation.numbersOnly(event)" />';
		}else{
			inputtype =  (selectedoperator == '=')?'radio':(selectedoperator == 'in' || selectedoperator == 'not_in')?'checkbox':'text';
			
			values = values.sort();
			for(x in values){
				valuetree[x] = methods.createValueTree(values,x,0,values[x]);
			}
			valuetree = methods.mergeValueTree(valuetree);
			valuecontent = methods.getValueTree(valuetree, inputtype, valuefieldparam, '', defaultBranchStatus);
		}
		return valuecontent;
	},
	addSearchRow: function (e, obj) {
		var isValidateSuccess, that = csStudio.rule.decision.search,
			data = csStudio.rule.decision.search.data, validate = csStudio.rule.decision.validate, selectedRule={};
			
		isValidateSuccess = validate.searchRowValidate(data);
		if (!isValidateSuccess) {
			if(data.selectedRule.attribute !='' && data.selectedRule.operator != '' && data.selectedRule.values == ''){
				alert("Select a Value");
			}else if(!(data.selectedRule.attribute && data.selectedRule.operator && data.selectedRule.values)){
				alert("All list boxes cannot be empty");
			}else{
				validate.showError(obj.target.targetError, 'SEARCH_ROW_ERR_MSG');
			}
			return false;
		}else{
			document.getElementById(obj.target.targetError).style.display='none';
			that.resetRowFields(obj.reset);
			data.setSelectedRuleList();
			document.getElementById(obj.target.targetRowContainer).innerHTML = that.createSelectedRow(obj.target.targetRowContainer);
			document.getElementById(obj.reset.connector).style.display='block';
			selectedRule.connector='Or';
			selectedRule.isEditRule=false;
			data.setSelectedRule(selectedRule);
			that.updateActiveRowName(obj.reset);
			YAHOO.util.Dom.removeClass('search-passive-row', 'searchpassive');
			YAHOO.util.Dom.addClass('search-active-row', 'searchactive');
		}
	},
	resetRowFields: function (object) {
		var data = csStudio.rule.decision.search.data, globalNS = csStudio.global;
		globalNS.listBoxUpdateSelectedIndex(object.connector,'Or');
		globalNS.listBoxUpdateSelectedIndex(object.attribute,'Select');
		globalNS.listBoxDataClear(object.operator);
		document.getElementById(object.value).innerHTML = '<div style="width:200px">&nbsp;</div>';
		document.getElementById(object.intermediateRule.activity).value='';
		document.getElementById(object.intermediateRule.tag).value='';
		document.getElementById(object.hiddenAttribute.activity).value='';
		document.getElementById(object.hiddenAttribute.tag).value='';
	},
	updateActiveRowName: function (object) {
		var data = csStudio.rule.decision.search.data, name='searchCriteriaList['+(data.rowCount)+'].';
		document.getElementById(object.connector).setAttribute('name', name+'condition');
		document.getElementById(object.attribute).setAttribute('name', name+'attribute');
		document.getElementById(object.operator).setAttribute('name', name+'operator');
		document.getElementById(object.intermediateRule.activity).setAttribute('name', name+'intermediateChannelActivityRule');
		document.getElementById(object.intermediateRule.tag).setAttribute('name', name+'intermediateApplicableOfferRule');
		document.getElementById(object.hiddenAttribute.activity).setAttribute('name', name+'activity');
		document.getElementById(object.hiddenAttribute.tag).setAttribute('name', name+'tag');
	},
	createSelectedRow: function (targetRow){
		var rowcontent="", data=csStudio.rule.decision.search.data, methods=csStudio.rule.decision.methods, that=csStudio.rule.decision.search, rulelist=data.getSelectedRuleList(),i, ruletype='', j, inputtype, valuetree= new Array(), valuefieldparam, defaultBranchStatus='collapse';
		
		for(i=0;i<rulelist.length;i++){
			ruletype = (rulelist[i].isActivity)?'activity':'tag';
			if(rulelist[i].isEditRule){
				data.setEditLists(i);
				rowcontent = rowcontent+'<div id="searchCriteriaList['+i+'].row"><p style="float: left; margin-right: 15px; clear: left; width:120px">';
				if(i>0){
					rowcontent = rowcontent+'<select style="width:100px; font-size:10px" id="searchCriteriaList['+i+'].condition" name="searchCriteriaList['+i+'].condition">'
					for (j=0;j<data.connectorList.length;j++) {
						rowcontent = rowcontent+'<option value="'+data.connectorList[j]+'" '+((data.connectorList[j]==rulelist[i].connector)?'selected':'')+'>'+data.connectorList[j]+'</option>';
					}
					rowcontent = rowcontent+'</select>';
				}else{
					rowcontent = rowcontent+'<input type="hidden" name="searchCriteriaList['+i+'].condition" value="" />'
				}
				rowcontent = rowcontent+'</p><p style="float: left; margin-right: 15px; width:240px">';
				rowcontent = rowcontent+'<select style="width:230px; font-size:10px" id="searchCriteriaList['+i+'].'+ruletype+'" name="searchCriteriaList['+i+'].'+ruletype+'" onchange="csStudio.rule.decision.search.onChangeEditAttribute(event, this, '+i+')" >';
				if(rulelist[i].isActivity){
					for (j=0;j<data.activityRuleList.length;j++) {
						rowcontent = rowcontent+'<option value="'+data.activityRuleList[j].attributeName+'" '+((data.activityRuleList[j].attributeName==rulelist[i].attribute)?'selected':'')+'>'+data.activityRuleList[j].attributeName+'</option>';
					}
				}else if(rulelist[i].isTag){
					for (j=0;j<data.applicableOfferRuleList.length;j++) {
						rowcontent = rowcontent+'<option value="'+data.applicableOfferRuleList[j].attributeName+'" '+((data.applicableOfferRuleList[j].attributeName==rulelist[i].attribute)?'selected':'')+'>'+data.applicableOfferRuleList[j].attributeName+'</option>';
					}
				}
				rowcontent = rowcontent+'</select>';
				rowcontent = rowcontent+'</p><p style="float: left; margin-right: 15px; width:90px">';
				rowcontent = rowcontent+'<select style="width:70px; font-size:10px" id="searchCriteriaList['+i+'].operator" name="searchCriteriaList['+i+'].operator" onchange="csStudio.rule.decision.search.onChangeEditOperator(event, this, '+i+')"  >';
				rowcontent = rowcontent+'<option value="" >Select</option>';
				if(data.editOperatorsList.length){
					for (j=0;j<data.editOperatorsList.length;j++) {
						rowcontent = rowcontent+'<option value="'+data.editOperatorsList[j]+'" '+((data.editOperatorsList[j]==rulelist[i].operator)?'selected':'')+' >'+data.editOperatorsList[j]+'</option>';
					}
				}else if(rulelist[i].operator){
					rowcontent = rowcontent+'<option value="'+rulelist[i].operator+'" selected>'+rulelist[i].operator+'</option>';
				}
				rowcontent = rowcontent+'</select>';
				rowcontent = rowcontent+'</p><div style="float: left; margin-right: 15px; margin-top: 12px; width:auto" id="searchCriteriaList['+i+'].valuesContainer">';
				if(rulelist[i].operator){
					if (data.editValuesList == '') {
						rowcontent = rowcontent+ '<input type="text" id="searchCriteriaList['+i+'].value" name="searchCriteriaList['+i+'].value" value="'+rulelist[i].values+'" onblur="" onkeypress="return csStudio.global.validation.numbersOnly(event)" />';
					}else{
						inputtype =  (rulelist[i].operator == '=')?'radio':(rulelist[i].operator == 'in' || rulelist[i].operator == 'not_in')?'checkbox':'text';
						data.editValuesList = data.editValuesList.sort();
						for(x in data.editValuesList){
							valuetree[x] = methods.createValueTree(data.editValuesList,x,0,data.editValuesList[x]);
						}
						valuetree = methods.mergeValueTree(valuetree);
						valuefieldparam = {
							id: 'editsearchCriteriaValuesList',
							name: 'searchCriteriaList['+i+'].value',
							actionblurmethod: '',
							actionclickmethod: 'csStudio.rule.decision.methods.selectParentCheckboxes(this)'
						}
						rowcontent = rowcontent+ methods.getValueTree(valuetree, inputtype, valuefieldparam, rulelist[i].values, defaultBranchStatus);
					}
				}
				rowcontent = rowcontent+'</div><p style="float: left; margin-right: 15px; vertical-align: bottom"><a style="border:0; text-decoration: none; font-size:11px" onclick="csStudio.rule.decision.search.saveSelectedRow(\''+targetRow+'\','+i+')" href="#">Save</a>&nbsp;<a style="border:0; text-decoration: none; font-size:11px" href="#" onclick="csStudio.rule.decision.search.cancelSelectedRow(\''+targetRow+'\','+i+')">Cancel</a></p>';
				if(rulelist[i].values && rulelist[i].isActivity){
					rowcontent = rowcontent+'<input type="hidden" name="searchCriteriaList['+i+'].intermediateChannelActivityRule" value="('+rulelist[i].attribute+" "+rulelist[i].operator+" "+(rulelist[i].values).replace(/,/g,'|')+')" />';
				}else if(rulelist[i].values && rulelist[i].isTag){
					rowcontent = rowcontent+'<input type="hidden" name="searchCriteriaList['+i+'].intermediateApplicableOfferRule" value="('+rulelist[i].attribute+" "+rulelist[i].operator+" "+(rulelist[i].values).replace(/,/g,'|')+')" />';
				}
				rowcontent = rowcontent+'</div>';
			}else{
				rowcontent = rowcontent+'<div id="searchCriteriaList['+i+'].row"><p style="float: left; margin-right: 15px; clear: left; width:120px">';
				if(i>0){
					rowcontent = rowcontent+'<select style="width:100px; font-size:10px" id="searchCriteriaList['+i+'].condition" name="searchCriteriaList['+i+'].condition" disabled="disabled"><option value="'+rulelist[i].connector+'">'+rulelist[i].connector+'</option></select>';
				}else{
					rowcontent = rowcontent+'<input type="hidden" name="searchCriteriaList['+i+'].condition" value="" />'
				}
				rowcontent = rowcontent+'</p><p style="float: left; margin-right: 15px; width:240px">';
				rowcontent = rowcontent+'<select style="width:230px; font-size:10px" id="searchCriteriaList['+i+'].'+ruletype+'" name="searchCriteriaList['+i+'].'+ruletype+'" disabled="disabled">';
				rowcontent = rowcontent+'<option value="'+rulelist[i].attribute+'" >'+rulelist[i].attribute+'</option>';
				rowcontent = rowcontent+'</select>';
				rowcontent = rowcontent+'</p><p style="float: left; margin-right: 15px; width:90px">';
				rowcontent = rowcontent+'<select style="width:70px; font-size:10px" id="searchCriteriaList['+i+'].operator" name="searchCriteriaList['+i+'].operator" disabled="disabled">';
				if(rulelist[i].operator){
					rowcontent = rowcontent+'<option value="'+rulelist[i].operator+'" >'+rulelist[i].operator+'</option>';
				}else{
					rowcontent = rowcontent+'<option value="">Select</option>';
				}
				rowcontent = rowcontent+'</select>';
				rowcontent = rowcontent+'</p><div style="float: left; margin-right: 15px; margin-top: 12px; width:200px"><span style="font-size:11px">'+(rulelist[i].values).replace(/\|/g,',')+'</span></div>';
				rowcontent = rowcontent+'<p style="float: left; margin-right: 15px; vertical-align: bottom"><a style="border:0; text-decoration: none; font-size:11px" href="#" id="searchCriteriaList['+i+'].edit" onclick="csStudio.rule.decision.search.editSelectedRow(\''+targetRow+'\','+i+')">Edit</a>&nbsp;<a href="#" id="searchCriteriaList['+i+'].delete" onclick="csStudio.rule.decision.search.deleteSelectedRow(\''+targetRow+'\','+i+')" style="display:inline-block;padding:0 2px"><img style="cursor: pointer" src="images/segment_minus_icon.gif" border="0"></a></p>';
				if(rulelist[i].values && rulelist[i].isActivity){
					rowcontent = rowcontent+'<input type="hidden" name="searchCriteriaList['+i+'].intermediateChannelActivityRule" value="('+rulelist[i].attribute+" "+rulelist[i].operator+" "+(rulelist[i].values).replace(/,/g,'|')+')" />';
				}else if(rulelist[i].values && rulelist[i].isTag){
					rowcontent = rowcontent+'<input type="hidden" name="searchCriteriaList['+i+'].intermediateApplicableOfferRule" value="('+rulelist[i].attribute+" "+rulelist[i].operator+" "+(rulelist[i].values).replace(/,/g,'|')+')" />';
				}
				rowcontent = rowcontent+'</div>';
			}
		}
		return rowcontent;
	},
	editSelectedRow: function (targetrow,editrownumber){
		var that = csStudio.rule.decision.search, data=csStudio.rule.decision.search.data;
		data.selectedRuleList[editrownumber].isEditRule=true;
		document.getElementById(targetrow).innerHTML = that.createSelectedRow(targetrow);
	},
	saveSelectedRow: function (targetRow, editrownumber){
		var that = csStudio.rule.decision.search, data=csStudio.rule.decision.search.data, isValidateSuccess=false, editoperator = '', editvalues = '';
		
		editoperator=document.getElementById('searchCriteriaList['+editrownumber+'].operator').value;
		editvalues = data.getEditSelectedValues(document.studioform['searchCriteriaList['+editrownumber+'].value']);
		
		if (editoperator!='' && editvalues==''){
			alert("Please Select Values!");
		}else if ((editoperator=='' && editvalues=='') || (editoperator!='' && editvalues!='')){
			if(document.getElementById('searchCriteriaList['+editrownumber+'].activity')){
				data.selectedRuleList[editrownumber].attribute=document.getElementById('searchCriteriaList['+editrownumber+'].activity').value;
			}else if(document.getElementById('searchCriteriaList['+editrownumber+'].tag')){
				data.selectedRuleList[editrownumber].attribute=document.getElementById('searchCriteriaList['+editrownumber+'].tag').value
			}
			data.selectedRuleList[editrownumber].operator=document.getElementById('searchCriteriaList['+editrownumber+'].operator').value;
			if(document.getElementById('searchCriteriaList['+editrownumber+'].condition')){
				data.selectedRuleList[editrownumber].connector=document.getElementById('searchCriteriaList['+editrownumber+'].condition').value;
			}
			
			data.selectedRuleList[editrownumber].values=editvalues;
			
			data.selectedRuleList[editrownumber].isEditRule=false;
			
			document.getElementById(targetRow).innerHTML = that.createSelectedRow(targetRow);
		}
	},
	cancelSelectedRow: function (targetrow, editrownumber){
		var that = csStudio.rule.decision.search, data=csStudio.rule.decision.search.data;
		data.selectedRuleList[editrownumber].isEditRule=false;
		document.getElementById(targetrow).innerHTML = that.createSelectedRow(targetrow);
	},
	deleteSelectedRow: function (targetrow,editrownumber) {
		var that = csStudio.rule.decision.search, data=csStudio.rule.decision.search.data, reset;
		
		if (data.selectedRuleList[editrownumber].isActivity) {
			data.activityCount = data.activityCount-1;
		}else if (data.selectedRuleList[editrownumber].isTag) {
			data.tagCount = data.tagCount-1;
		}
		(data.selectedRuleList).splice(editrownumber,1);
		data.rowCount = data.rowCount-1;
	
		if (data.rowCount > 0) {			
			if ((data.selectedRuleList[data.selectedRuleList.length-1].isTag  && data.activityCount == 0) || (data.selectedRuleList[data.selectedRuleList.length-1].isActivity && data.tagCount == 0)) {
				data.isActivityDisable = false;
				data.isTagDisable = false;
			}
		}else{
			data.isActivityDisable = false;
			data.isTagDisable = false;
			data.selectedRule.connector="";
		}
		reset = {
			connector:'rule-search-connector',
			attribute:'rule-search-attribute',
			operator:'rule-search-operator',
			value:'rule-search-values',
			intermediateRule: {
				activity: 'rule-search-intermediateActivity',
				tag: 'rule-search-intermediateTag'
			},
			hiddenAttribute: {
				activity: 'rule-search-attribute-activity',
				tag: 'rule-search-attribute-tag'
			}
		};
		that.updateActiveRowName(reset);
		document.getElementById(targetrow).innerHTML = that.createSelectedRow(targetrow);
		if(data.rowCount==0){
			YAHOO.util.Dom.addClass('search-passive-row', 'searchpassive');
			YAHOO.util.Dom.removeClass('search-active-row', 'searchactive');
			document.getElementById(reset.connector).style.display='none';
		}
	},
	onChangeEditAttribute: function (event, obj, rownumber) {
		var data = csStudio.rule.decision.search.data, globalNS = csStudio.global, operatorsList;
		operatorsList = data.getOperatorsOrValues(obj.value,'operators');
		document.getElementById('searchCriteriaList['+rownumber+'].valuesContainer').innerHTML='&nbsp;';
		globalNS.listBoxDataFill('searchCriteriaList['+rownumber+'].operator', operatorsList);
	},
	onChangeEditOperator: function (event, obj, rownumber) {
		var i, data = csStudio.rule.decision.search.data, values, selectedAttribute, selectedOperator, editvaluescontent='',  
			globalNS = csStudio.global, valuefieldparam, that = csStudio.rule.decision.search;
		
		if(document.getElementById('searchCriteriaList['+rownumber+'].activity')){
			selectedAttribute = document.getElementById('searchCriteriaList['+rownumber+'].activity').value;
		}else if(document.getElementById('searchCriteriaList['+rownumber+'].tag')){
			selectedAttribute = document.getElementById('searchCriteriaList['+rownumber+'].tag').value;
		}
		
		selectedOperator = document.getElementById('searchCriteriaList['+rownumber+'].operator').value;
		values = data.getOperatorsOrValues(selectedAttribute,'values');
		
		if (selectedOperator) {
			valuefieldparam = {
				id: 'editsearchCriteriaValuesList',
				name: 'searchCriteriaList['+rownumber+'].value',
				actionblurmethod: '',
				actionclickmethod: 'csStudio.rule.decision.methods.selectChildCheckboxes(this)'
			}
			document.getElementById('searchCriteriaList['+rownumber+'].valuesContainer').innerHTML=that.getValuesContent(values, selectedOperator, valuefieldparam);
			data.editRule.values = '';
		}else{
			globalNS.removeChildNodes('searchCriteriaList['+rownumber+'].valuesContainer');
		}
	},
	getDecisionRulesList: function (e, obj) {
		var globalNS = csStudio.global, isValidateSuccess, that = csStudio.rule.decision.search,
			data = csStudio.rule.decision.search.data, validate = csStudio.rule.decision.validate;
		
		isValidateSuccess = validate.searchRowValidate(data);
		if (isValidateSuccess) {
			that.setActiveRowIntermediateRule(obj.target);
		}else{
			if(data.selectedRule.attribute !='' && data.selectedRule.operator != '' && data.selectedRule.values == ''){
				alert("Select a Value");
				return false;
			} else {
				document.getElementById(obj.target.intermediateRule.activity).value='';
				document.getElementById(obj.target.intermediateRule.tag).value='';
				document.getElementById(obj.target.hiddenAttribute.tag).value='';
				document.getElementById(obj.target.hiddenAttribute.activity).value='';
			}
		}
		globalNS.asyncFormSubmit(e, obj);
	},
	setActiveRowIntermediateRule: function(object){
		var data=csStudio.rule.decision.search.data, rulename='';
		if( data.selectedRule.attribute && data.selectedRule.operator && (data.selectedRule.values).trim()) {
			if(data.isActivity){
				document.getElementById(object.intermediateRule.activity).value='('+data.selectedRule.attribute+" "+data.selectedRule.operator+" "+data.selectedRule.values+')';
			}else if(data.isTag){
				document.getElementById(object.intermediateRule.tag).value='('+data.selectedRule.attribute+" "+data.selectedRule.operator+" "+(data.selectedRule.values).replace(/,/g, '|')+')';
			}
		}else if(data.selectedRule.attribute != ''){
			if(data.isActivity){
				document.getElementById(object.hiddenAttribute.activity).value=data.selectedRule.attribute;
				document.getElementById(object.hiddenAttribute.tag).value='';
			}else if(data.isTag){
				document.getElementById(object.hiddenAttribute.tag).value=data.selectedRule.attribute;
				document.getElementById(object.hiddenAttribute.activity).value='';
			}else{
				document.getElementById(object.hiddenAttribute.activity).value='';
				document.getElementById(object.hiddenAttribute.tag).value='';
			}
			document.getElementById(object.intermediateRule.activity).value='';
			document.getElementById(object.intermediateRule.tag).value='';
		}
	},
	cloneDecisionRule: function (e, index) {
		var globalNS = csStudio.global, decisionCloneObj = {cmd:'_clone-rule',url:'/campaignstudio/responsebasedsearchdata.htm',container:'decisionDataContainer'};
		document.getElementById('selectedRuleId').value = index;	
		globalNS.asyncFormSubmit(e, decisionCloneObj);
	},
	deleteDecisionRule: function (e, index){
		var globalNS = csStudio.global, del = confirm("Do you want to delete the rule?");
		if (del == false){
			return false;
		}else{
			document.getElementById('selectedRuleId').value = index;
			var decisionDeleteObj = {cmd:'_delete-rule',url:'/campaignstudio/responsebasedsearchdata.htm',container:'decisionDataContainer'};
			globalNS.asyncFormSubmit(e, decisionDeleteObj);
		}	
	},
	resetSearch: function (e, obj) {
		var that = csStudio.rule.decision.search, data = csStudio.rule.decision.search.data, globalNS = csStudio.global;
		document.getElementById(obj.target.targetError).style.display='none';
		document.getElementById(obj.target.targetName).value = '';
		globalNS.listBoxUpdateSelectedIndex(obj.target.targetOwner,'Select');
		globalNS.listBoxUpdateSelectedIndex(obj.target.targetPeriod,'Select');
		document.getElementById(obj.target.targetRowContainer).innerHTML = '';
		that.resetRowFields(obj.reset);
		document.getElementById(obj.reset.connector).style.display='none';
		YAHOO.util.Dom.addClass('search-passive-row', 'searchpassive');
		YAHOO.util.Dom.removeClass('search-active-row', 'searchactive');
		data.resetData();
		that.updateActiveRowName(obj.reset);
	},
	editSearchResultRule: function(element,id){
		var i, methods=csStudio.rule.decision.methods, reset={
			connector:'rule-connector',
			attribute:'rule-attribute',
			operator:'rule-operator',
			value:'rule-values'
		};
		
		document.getElementById('ruleInterface').style.display="block";
		document.getElementById('failure').style.display="none";
		for (i=0;i<this.searchResultCount;i++) {
			if(this.searchResultList[i].id == id){
				document.getElementById('decisionRule.ruleName').value=this.searchResultList[i].ruleName;
				document.getElementById('decisionRule.id').value=this.searchResultList[i].id;
				document.getElementById('decisionRule.ruleCoded').value=this.searchResultList[i].ruleCoded;
			}
		}
		var table = document.getElementById('ruleSearchTable');
		for (i = table.rows.length - 1; i > 0; i--) {
			table.rows[i].style.backgroundColor = "#fff";
		}
		element.parentNode.parentNode.style.backgroundColor = "#ffffcc";
		methods.loadRule('decisionRule.ruleCoded');
		methods.resetRowFields(reset);
	},
	clearEditSearchResultRule: function(){
		var table,i;
		document.getElementById('ruleInterface').style.display="none";
		document.getElementById('decisionRule.ruleName').value="";
		document.getElementById('decisionRule.id').value=0;
		document.getElementById('decisionRule.ruleCoded').value="";
		var table = document.getElementById('ruleSearchTable');
		for (i = table.rows.length - 1; i > 0; i--) {
			table.rows[i].style.backgroundColor = "#fff";
		}
		csStudio.rule.decision.data.resetData();
	},
	saveRule: function (e, obj) {
		var globalNS = csStudio.global, studioform = document[obj.form],
			that = csStudio.rule.decision.create,
			validate = csStudio.rule.decision.validate;
		
		that.setIntermediateRule(obj);
		document.getElementById('cmd').value=obj.cmd;
		studioform.action=obj.targetAction;
		if (validate.canSubmitForm(obj)) {
			globalNS.asyncFormSubmit(e, obj);
		}
	}
};
csStudio.rule.decision.search.data.getOperatorsOrValues = function(attribute, request){
	var i;
	for (i=0; i<this.activityRuleList.length; i++) {
		if (this.activityRuleList[i].attributeName == attribute) {
			if(request == 'operators'){
				return (this.activityRuleList[i].operators).slice(1,-1).split(', ');
			}else if(request == 'values'){
				return (this.activityRuleList[i].values).slice(1,-1).split(',');
			}
		}
	}
	for (i=0; i<this.applicableOfferRuleList.length; i++) {
		if (this.applicableOfferRuleList[i].attributeName == attribute) {
			if(request == 'operators'){
				return (this.applicableOfferRuleList[i].operators).slice(1,-1).split(', ');
			}else if(request == 'values'){
				return (this.applicableOfferRuleList[i].values).slice(1,-1).split(',');
			}
		}
	}
};

csStudio.rule.decision.search.data.getEditSelectedValues = function (element) {
		var selectedValue = '', i;
		
		if(element && element.length>0){
			for(i=0;i<element.length;i++){
				if (element[i].type == 'radio' && element[i].checked) {
					selectedValue = element[i].value;
				}else if (element[i].type == 'checkbox' && element[i].checked) {
					if (selectedValue != '' && !((element[i].value).split(',').length > 1)) {
						if((!element[i+1].checked) || ((element[i+1].value).search(element[i].value) == -1 )){
							selectedValue = selectedValue + "," +element[i].value;
						}
					}else if(selectedValue == '' && !((element[i].value).split(',').length > 1)){
						if((!element[i+1].checked) || ((element[i+1].value).search(element[i].value) == -1 )){
							selectedValue = element[i].value;
						}
					}
				}
			}
		}else if(element && element.type == 'text' ){
			selectedValue = element.value;
		}
		return selectedValue;
};
csStudio.rule.decision.validate = {
	selectedFieldCheck: function (data, type) {
		var returnvalue = {status:true, message:''};
		
		if(type 
			&& 				
			((type == 'search')
			&&
			!((data.activityCount == 0 && data.tagCount == 0 && !data.selectedRule.connector) || ((data.activityCount > 0 || data.tagCount > 0) && data.selectedRule.connector)))				
		) {
			returnvalue.status = false;
			returnvalue.message = 'CONNECTOR_NULL_ERR_MSG';
			return returnvalue;
		}
		if(type && (type == 'create') && (!data.selectedRule.connector)) {
			returnvalue.status = false;
			returnvalue.message = 'CONNECTOR_NULL_ERR_MSG';
			return returnvalue;
		}
		if(!data.selectedRule.attribute){
			returnvalue.status = false;
			returnvalue.message = 'ATTRIBURE_NULL_ERR_MSG';
			return returnvalue;
		}
		if(!data.selectedRule.operator){
			returnvalue.status = false;
			returnvalue.message = 'OPERATOR_NULL_ERR_MSG';
			return returnvalue;
		}
		if(!(data.selectedRule.values).trim()){
			returnvalue.status = false;
			returnvalue.message = 'VALUES_NULL_ERR_MSG';
			return returnvalue;
		}
		return returnvalue;
	},
	editRowCheck: function (data) {
		var returnvalue = false;
		if (data.editRule.attribute && data.editRule.operator && (data.editRule.values).trim() && data.editRule.connector) {
			returnvalue = true;
		}else {
			returnvalue = false;
		}
		return returnvalue; 
	},
	searchRowValidate: function (data){
		var returnvalue = false, selectedFieldCheck = this.selectedFieldCheck(data, 'search');
		if((data.selectedRule.attribute && (data.selectedRule.operator =="") && ((data.selectedRule.values).trim()=="")) || selectedFieldCheck.status) {
			returnvalue = true;
		}
		return returnvalue;
	},
	showError: function (target, message) {
		var error = csStudio.rule.decision.ERROR;
		document.getElementById(target).innerHTML = error[message];
		document.getElementById(target).style.display='block';
	},
	hideError: function (target) {
		if (document.getElementById(target.targetError)) {
			document.getElementById(target.targetError).innerHTML = '';
			document.getElementById(target.targetError).style.display='none';
		}
		if (document.getElementById(target.targetSuccess)) {
			document.getElementById(target.targetSuccess).innerHTML = '';
			document.getElementById(target.targetSuccess).style.display='none';
		}
	},
	canDeleteRows: function (data){
		if(data.selectedRows == ''){
			return false;
		}else{
			return true;
		}
	},
	canSubmitForm: function (target) {
		if (document.getElementById(target.targetRuleName).value == '') {
			alert('Rule Name is Empty!');
			return false;
		}
		return true;
	},
	validateConnector: function (data,targetConnector) {
		var returnvalue = true;
		if (((data.activityCount == 0 && data.isActivity) || (data.tagCount == 0 && data.isTag)) && (data.selectedRule.connector != 'And') )  {
			returnvalue = false;
		}
		return returnvalue;
	},
	validateEditConnector: function (data, connector, rownumber){
		var returnvalue = true;
		
		if(rownumber==0 && connector=='Or'){
			return false;
		}else if( (rownumber != 0)  && 
			(((data.selectedRuleList[rownumber-1].isActivity && data.selectedRuleList[rownumber].isTag) || (data.selectedRuleList[rownumber].isActivity && data.selectedRuleList[rownumber-1].isTag)) && (connector == 'Or')))
		{
				return false;
		}
		return returnvalue;
	},
	canEnableSave: function (data,target) {
		if (data.activityCount > 0 && data.tagCount > 0) {
			document.getElementById(target.save).disabled=false;
		}else{
			document.getElementById(target.save).disabled=true;
		}
	},
	canEnableDelete: function (data,target) {
		if (data.rowCount > 0) {
			document.getElementById(target.deletebutton).disabled=false;
		}else{
			document.getElementById(target.deletebutton).disabled=true;
		}
	},
	canEnableGroup: function (data,target) {
		if (data.activityCount > 1 || data.tagCount > 1) {
			document.getElementById(target.group).disabled=false;
			document.getElementById(target.ungroup).disabled=false;
		}else{
			document.getElementById(target.group).disabled=true;
			document.getElementById(target.ungroup).disabled=true;
		}
	},
	canGroupRow: function (data) {
		var selectedrows= [], i, groupCount=0, ruleTypeCheck='';
		selectedrows = data.getSelectedRow().split(',').sort(function (a,b) {return b-a});
		if (selectedrows != '') {
			for (i=0;i<selectedrows.length;i++) {
				if (ruleTypeCheck == '') {
					
					if (data.selectedRuleList[selectedrows[i]].isTag) {
						ruleTypeCheck = 'tag';
					}else{
						ruleTypeCheck = 'activity';
					}
					groupCount += 1;
				}else{
					
					if (data.selectedRuleList[selectedrows[i]].isTag) {
						if (ruleTypeCheck == 'tag') {
							if (groupCount==1 && (selectedrows[i-1]-1 != selectedrows[i])) {
								return false;
							}
							groupCount += 1;
						}else{
							if (groupCount > 1) {
								groupCount =1;
								ruleTypeCheck = 'tag';
							}else{
								return false;
							}
						}
					}
					if (data.selectedRuleList[selectedrows[i]].isActivity) {
						if (ruleTypeCheck == 'activity') {
							if (groupCount==1 && (selectedrows[i-1]-1 != selectedrows[i])) {
								return false;
							}
							groupCount += 1;
						}else{
							if (groupCount > 1) {
								groupCount =1;
								ruleTypeCheck = 'activity';
							}else{
								return false;
							}
						}
					}
				}
			}
		}else{
			return false;
		}
		if (groupCount > 1) {
			return true;
		}else{
			return false;
		}
	},
	canUnGroupRow: function (data) {
		var selectedrows=[], i;
		
		selectedrows = data.getSelectedRow().split(',').sort(function (a,b) {return b-a});
		if (selectedrows != '') {
			for (i=0;i<selectedrows.length;i++) {
				if (!data.selectedRuleList[selectedrows[i]].isGrouped) {
					return false;
				}
			}
		}else{
			return false
		}
		return true;
	}
};

csStudio.rule.decision.ERROR = {
	RULE_SWAP_ERR_MSG: "<p>You can't add <strong>Activity Rule</strong> after <strong>Classification Rule</strong> & Vice Versa.</p>",
	RULE_SWAP_ERR_ALERT: "You can't add Activity Rule after Classification Rule & Vice Versa.",
	GROUP_ROW_ERR_MSG: "<p>Please select atleast 2 <strong>Activity Rule</strong> rows or 2 <strong>Classification Rule</strong> rows sequentially to group. Activity & Classification rows cannot be grouped with one another.</p>",
	GROUP_EMPTY_ROW_ERR_MSG: "<p>Please selected atleast two valid rows to group.</p>",
	UNGROUP_ROW_ERR_MSG: "<p>Please select valid grouped rows to ungroup.</p>",
	EDIT_ROW_ERR_MSG: "<p>Please select required fields <strong>And/Or, Attributes, Operators & Values</strong> at edit row before clicking save.",
	INVALID_CONNECTOR_ERR_MSG: "<p>Please select <strong>And</strong> as connector between <strong>Period</strong>, <strong>Activity Rule</strong> and <strong>Classification Rule</strong>.</p>",
	DELETE_ROW_ERR_MSG: "<p>Please select atleast one row to delete.</p>",
	SEARCH_ROW_ERR_MSG: "<p>Please select required fields <strong>And/or, Attributes, Operators & Values</strong> before adding the search row.</p>",
	ATTRIBURE_NULL_ERR_MSG: "<p>Please select <strong>Attribute</strong>.</p>",
	OPERATOR_NULL_ERR_MSG: "<p>Please select <strong>Operator</strong>.</p>",
	VALUES_NULL_ERR_MSG: "<p>Please select <strong>Values</strong>.</p>",
	CONNECTOR_NULL_ERR_MSG: "<p>Please select <strong>And/Or</strong>.</p>"
}
