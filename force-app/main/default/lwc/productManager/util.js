

export const columns = [

    {
        label: 'Name',
        fieldName: 'product_link',
        type: 'url',
        wrapText: true,
        typeAttributes: {
            label: { 
                fieldName: 'Product2_Name' 
            }, 
            target: '_blank'
        },
        sortable: true
    },

    {
        label: 'Family',
        fieldName: 'Family',
        type: 'text',
        sortable: true,
        editable: false,
        hideDefaultActions: true,
    },
    
    {
        label: 'Quantity',
        fieldName: 'Quantity',
        type: 'number',
        sortable: true,
        editable: true,
        hideDefaultActions: true,
    },
    
    {
        label: 'Unit Price',
        fieldName: 'UnitPrice',
        type: 'number',
        sortable: true,
        editable: true,
        hideDefaultActions: true,
    },
    {
        label: 'Total Price',
        fieldName: 'TotalPrice',
        type: 'number',
        sortable: true,
        editable: false,
        hideDefaultActions: true,
    },
    

    {
        label: 'Modified',
        fieldName: 'modDate',
        type: 'date',
        sortable: true,
        editable: false,
        hideDefaultActions: true,
        typeAttributes:{
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        },
    },
    
    {
        //label: 'Actions',
        type: 'action',
        typeAttributes: { 
            fieldName: "rowActions",
            rowActions: [
                {
                    label: 'Item Detail',  //Required. The label that's displayed for the action
                    name: 'item_link',   //Required. The name of the action, which identifies the selected action
                    iconName: 'utility:list', //The name of the icon to be displayed to the right of the action item.
                },
                {
                    label: 'Delete Item',  //Required. The label that's displayed for the action
                    name: 'delete_item',   //Required. The name of the action, which identifies the selected action
                    iconName: 'utility:list', //The name of the icon to be displayed to the right of the action item.
                },
            ], 
            menuAlignment: 'auto',
        } 
    },
]


/**
 * return array of pre mapped rows
 * @param {Array} files 
 */
export function fieldMap(records){

    return records.map(record => {

        const object = Object.assign({}, record)

        object.Product2_Name = object.Product2.Name ? object.Product2.Name : ''

        object.Name = object.Product2.Name ? object.Product2.Name : ''
        
        object.Family = object.Product2.Family ? object.Product2.Family : ''
        
        object.item_link = `/lightning/r/OpportunityLineItem/${object.Id}/view`

        object.product_link = `/lightning/r/Product2/${object.Product2.Id}/view`

        object.modDate = new Date(object.LastModifiedDate).toLocaleString('en-US', { 
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric', 
            minute: 'numeric', 
            hour12: true 
        })
        
        return object
    })
}

/* 
Id: "00kM000000BzkHMIAZ"
LastModifiedDate: "2020-12-11T04:28:59.000Z"
Product2:
Family: "EMP"
Id: "01tM000000Cv53xIAB"
Name: "Add a Tier to Search Program - Email and Digital"
__proto__: Object
Product2Id: "01tM000000Cv53xIAB"
Quantity: 1
TotalPrice: 1500
UnitPrice: 1500


/* const {
    families,
} = options;

const fields = [
    ...options.fields, //.replace(/ /g, '').split(','),
    'Actions',
]

const columns = fields.reduce((cols, field) => [
    ...cols, 
    columnMap(families)[field]
], []); 
*/

/**
 * Sort records via given parameters
 * @param {Array} records array of records to sort ([])
 * @param {String} fieldName name of field to sort by (Name)
 * @param {String} sortDirection direction to sort by (asc|desc)
 * @param {Object} options what to consider during sort; {date_fields}
 * @returns {Array} sorted array
 */
export function sortData(records, fieldName, sortDirection, options = {}) {

    const { 
        date_fields,
        numeric_fields,
    } = options;

    if(numeric_fields.includes(fieldName)) {
        
        if(sortDirection === "desc") {

            return records.sort((A,B) => {

                const a = A[fieldName] ? A[fieldName] : 0
                const b = B[fieldName] ? B[fieldName] : 0

                return b - a
            })
        }
        else if(sortDirection === "asc") {

            return records.sort((A,B) => {

                const a = A[fieldName] ? A[fieldName] : 0
                const b = B[fieldName] ? B[fieldName] : 0

                return a - b
            })
        }
    }
    if(date_fields.includes(fieldName)) {
        
        if(sortDirection === "desc") {

            return records.sort((A,B) => {

                const a = A[fieldName] ? A[fieldName] : 0
                const b = B[fieldName] ? B[fieldName] : 0

                return new Date(b).getTime() - new Date(a).getTime()
            })
        }
        else if(sortDirection === "asc") {

            return records.sort((A,B) => {

                const a = A[fieldName] ? A[fieldName] : 0
                const b = B[fieldName] ? B[fieldName] : 0

                return new Date(a).getTime() - new Date(b).getTime()
            })
        }
    }

    

    if(sortDirection === "desc") {

        return records.sort((A,B) => {

            const a = A[fieldName] ? A[fieldName] : ''
            const b = B[fieldName] ? B[fieldName] : ''

            return b.toUpperCase() < a.toUpperCase() 
                ? -1
                : b.toUpperCase() > a.toUpperCase() 
                    ? 1
                    : 0 //equal
        });
    }
    else if(sortDirection === "asc") {

        return records.sort((A,B) => {

            const a = A[fieldName] ? A[fieldName] : ''
            const b = B[fieldName] ? B[fieldName] : ''

            return a.toUpperCase() < b.toUpperCase() 
                ? -1
                : a.toUpperCase() > b.toUpperCase() 
                    ? 1
                    : 0 //equal
        });
    }

    return records
}



/**
 * Filter records via given parameters
 * @param {Array} records array of records to filter ([{},{}])
 * @param {Array} props array of properties to filter on [Name,Family]
 * @param {String} value value to filter by
 * @returns {Array} filtered array
 */
export function filterData(records, props, value) {

	return records.filter(record => {
		return props.some(field => {
			return String(record[field]).toLocaleLowerCase().includes(value.toLocaleLowerCase())
		})
	})
}
