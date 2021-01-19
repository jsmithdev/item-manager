import { api, LightningElement, wire, track } from 'lwc';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import { 
    getObjectInfo,
    getPicklistValues, 
} from 'lightning/uiObjectInfoApi'

import {
    fieldMap,
    sortData,
    filterData,
    columns,
} from './util'

import Product2 from '@salesforce/schema/Product2'
import fieldApiName from '@salesforce/schema/Product2.Family'

import getOppItems from '@salesforce/apex/ProductManager.getOppItems'
import addOppItems from '@salesforce/apex/ProductManager.addOppItems'
import deleteOppItem from '@salesforce/apex/ProductManager.deleteOppItem'
import updateItems from '@salesforce/apex/ProductManager.updateItems'

export default class ProductManager extends LightningElement {

    all_files = []

    columns = columns

    filters = ['Name', 'Family', 'modDate']

    @api header
    @api iconName
    @api fields
    @api recordId = '006M000000MdpVDIAZ'
    @api showDebug = false


    @track loading = false
    @track files = []
    @track sortedBy = 'LastModifiedDate'
    @track sortedDirection = 'desc'
    @track viewable_files = []
    
    @wire(getObjectInfo, { objectApiName: Product2 })
    object;

    @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName  })
    wiredPicklist({error, data}){
        
        if(this.picklist_ran){return}
        if(data){
            this.picklist = data
            this.picklist_ran = true
            this.refreshExistingFiles()
        }
        else if(error){
            this.error(error.message)
        }
    }

    get existing_files(){
        return this.all_files
    }
    set existing_files(files){
        this.viewable_files = files
        this.all_files = files
    }

    get filterFamilies(){ 
        return [{label: '(No Filter)', value: undefined, key: 'noFilterZero'}, ...this.families]
    }

    get families(){

        return this.picklist === undefined
            ? []
            : this.picklist.values.map((v,i) => ({ label: v.label, value: v.value, key: `_k${i}` }))
    }

    get recordTypeId (){
        return this.object.data ? this.object.data.defaultRecordTypeId : undefined
    }

    get mappedFields(){ return this._fields.map(f => {
        if(f === 'LastModifiedDate'){
            return 'modDate'
        }
        else {
            return f
        }
    })}

    async refreshExistingFiles(data){

        const json =  data ? data : await getOppItems({ oppId: this.recordId })
    
        this.existing_files = fieldMap( json )
        
        //this.debug()
    }

    async selected(event){

        console.log('main select')
        
        const {
            name,
            selected,
        } = event.detail

        const newOppItems = selected.map(row => ({
            OpportunityId: this.recordId,
            Product2Id: row.product.Id, 
            Quantity: row.Quantity,
            UnitPrice: row.UnitPrice
        }))


        //console.log(JSON.parse(JSON.stringify({name, newOppItems})))

        const result = await addOppItems({newOppItems})

        //console.log('result=>')
        //console.log(JSON.parse(JSON.stringify({result})))

        this.refreshExistingFiles(result)

        this.toast(`Added ${selected.length} from ${name}`, 'Success', 'success')

    }
    async managerChanged(event){
        
        const { 
            row,
            action,
        } = event.detail

        //console.log({row,action,})

        if(action.name === 'download'){
            window.open(row.download_link, '_target')
        }
        if(action.name === 'item_link'){
            window.open(row.item_link, '_target')
        }
        if(action.name === 'delete_item'){
            this.loading = true
            const name = row.Name
            const records = await deleteOppItem( { recordId: row.Id } )
            this.toast(`Removed ${name}`, 'success', 'success')
            this.refreshExistingFiles(records)
            this.loading = false
        }
        
        //console.log(JSON.parse(JSON.stringify({
        //    existing_files: this.existing_files,
        //    eventdetail: event.detail,
        //})))
    }

    async handleSave(event){
        
        try {
                
            const items = event.detail.draftValues
            
            const results = await updateItems({ items, oppId: this.recordId })
            
            this.refreshExistingFiles(results)

            this.toast(`Updated ${items.length} items`, 'Success', 'success')
        }
        catch (error) {
            this.error(error.message)
        }
    }

    updateColumnSorting(event) {
        
        this.sortedBy = event.detail.fieldName;
        this.sortedDirection = event.detail.sortDirection;

        const text_fields = ['Family', 'Name', 'owner']
        const date_fields = ['modDate']
        const numeric_fields = ['Quantity, UnitPrice, TotalPrice']

        const options = {
            text_fields,
            date_fields,
            numeric_fields,
        }

        this.viewable_files = sortData(
            this.viewable_files, 
            this.sortedBy, 
            this.sortedDirection,
            options,
        );
    }

    filterItems(event) {

        const {
            name,
            value
        } = event.target;

        const fields = ['Name', 'Family']

        if(name === 'Family') { this._currentFam = value }
        if(name === 'Any') { this._currentAny = value }

        if(!value && name === 'Any' && this._currentFam){

            this._currentAny = undefined;
            this.viewable_files = filterData(this.existing_files, ['Family'], this._currentFam);
        }
        else if(!value && name === 'Family' && this._currentAny){

            this._currentFam = undefined;
            this.viewable_files = filterData(this.existing_files, fields, this._currentAny);
        }
        else if(name === 'Any' && this._currentFam){

            const possibles = filterData(this.existing_files, ['Family'], this._currentFam);
            this.viewable_files = filterData(possibles, fields, this._currentAny);
        }
        else if(!value){

            this.viewable_files = this.existing_files;
        }
        else {
            const _fields = name === 'Any' ?  fields : [name];
            
            this.viewable_files = filterData(this.existing_files, _fields, value);
        }
    }

    toast( message = '', title = 'Info', variant = 'info') {
        
        const event = new ShowToastEvent({
            title,
            message,
            variant,
        })

        this.dispatchEvent(event)
    }
    error(message){
        this.toast(message, 'Error', 'error')
    }

    debug(){
        
        console.log(JSON.parse(JSON.stringify({
            picklist: this.picklist,
            families: this.families,
            viewable_files: this.viewable_files,
            existing_files: this.existing_files,
            all_files: this.viewable_files,
        })))
    }
}
/* 

console.log(JSON.parse(JSON.stringify({
    name,
    value,
    exist: this.existing_files,
    view: this.viewable_files,
})))
*/