import { api, track, LightningElement } from 'lwc';

import getAllProducts from '@salesforce/apex/ProductManager.getAllProducts'

import {
    fieldMap,
    sortData,
    filterData,
    columns,
} from './util'

export default class Products extends LightningElement {

    @track sortedBy = 'LastModifiedDate'
    @track sortedDirection = 'desc'
    @track viewable_files = []
    @track loading = false

    groups = []
    columns = columns

    @api
    get families(){
        return this.all_families
    }
    set families(families){
        if(families && !this.all_families){
            this.all_families = families
            this.refreshExistingFiles()
        }
    }

    get filterFamilies(){ 
        return [{label: '(No Filter)', value: undefined, key: 'noFilterZero'}, ...this.families]
    }

    
    async refresh(){
        const groups = this.groups
        this.groups = []
        setTimeout(() => {this.groups = groups}, 0)
    }
    
    async refreshExistingFiles(){

        this.loading = true

        const records = await getAllProducts()

        //this.debug({'hello': 'there', records})

        const families = [...this.families]

        this.groups = fieldMap( records, families )

        //this.debug()

        this.loading = false
    }

    addSelected(event){

        const { name } = event.target

        const datatable = this.template.querySelector(`lightning-datatable.${name}`)

        const selected = datatable.getSelectedRows()
        
        this.dispatchEvent(new CustomEvent("selected", {
            composed: true,
            detail: {
                name,
                selected,
            }
        }))

        //this.refresh()
    }
    
    updateColumnSorting(event) {
        
        this.sortedBy = event.detail.fieldName;
        this.sortedDirection = event.detail.sortDirection;

        const text_fields = ['Family', 'Name', 'owner']
        const date_fields = ['modDate']

        const options = {
            text_fields,
            date_fields,
        }

        this.viewable_files = sortData(
            this.viewable_files, 
            this.sortedBy, 
            this.sortedDirection,
            options,
        );
    }

    handleSave(event){
        
        try {
                
            const prods = event.detail.draftValues

            this.updateProducts(prods)
        }
        catch (error) {
            this.error(error)
        }
    }

    rowAction(event){
        
        const { 
            row,
            action,
        } = event.detail

        this.debug({row,action: action.name})

        if(action.name === 'add' 
        || (typeof row === 'object' && row.Family) ){

            this.dispatchEvent(new CustomEvent("selected", {
                composed: true,
                bubbles: true,
                detail: {
                    name: row.Family,
                    selected: [row],
                }
            }))
            //window.open(row.download_link, '_target')
        }
        if(action.name === 'detail'){
            window.open(row.detail_link, '_target')
        }
        if(action.name === 'delete'){
            this.deleteDocument( row.Id )
        }
        
        //console.log(JSON.parse(JSON.stringify({
        //    existing_files: this.existing_files,
        //    eventdetail: event.detail,
        //})))
    }
    
    handleToggleSection(event) {

        //event.detail.openSections;
    }

    toast( message = '', title = 'Info', variant = 'info') {
        
        const event = new ShowToastEvent({
            title,
            message,
            variant,
        })

        this.dispatchEvent(event)
    }
    /* toast Error */
    error({message}){
        this.toast(message, 'Error', 'error')
    }

    debug(data){

        console.log('products debug')
        if(data){
            return console.log(JSON.parse(JSON.stringify({data})))
        }
        
        console.log(JSON.parse(JSON.stringify({
            columns: this.columns,
            groups: this.groups,
            families: this.families,
            viewable_files: this.viewable_files,
            existing_files: this.existing_files,
            all_files: this.viewable_files,
        })))
    }
}
/* 

async updateFamily( event ) {

    try {

        const {
            type,
            value,
            context,
        } = event.detail

        const result = await updateFamily({ recordId: context, family: value })
        
        console.log(result)
        
        //this.refreshExistingFiles()

        //this.toast(result, 'Success', 'success')
    }
    catch (error) {
        this.error(error)
    }
}

async deleteProduct( recordId ) {

    try {
        
        const result = await deleteProduct({ recordId })

        this.refreshExistingFiles()

        this.toast(result, 'Success', 'success')

    }
    catch (error) {
        this.error(error)
    }
}

async updateProducts( prods ) {

    try {
        
        const result = await updateProducts({ prods })

        this.refreshExistingFiles()

        this.toast(result, 'Success', 'success')
    }
    catch (error) {
        this.error(error)
    }
}
    */