public with sharing class ProductManager {

    @AuraEnabled
    public static List<OpportunityLineItem> getOppItems(String oppId){

        return [
            SELECT Id, Product2.Id, Product2.Name, Product2.Family, Quantity, UnitPrice, 
                Discount, TotalPrice, LastModifiedDate
            FROM OpportunityLineItem 
            WHERE OpportunityId = :oppId
            LIMIT 9999
        ];
    }

    @AuraEnabled
    public static List<OpportunityLineItem> updateItems(List<OpportunityLineItem> items, String oppId){

        update items;
        // query to get updated formulas
        return ProductManager.getOppItems(oppId);
    }
    
    public class ProductConfig {
        @AuraEnabled 
        public Product2 product {get;set;}
        @AuraEnabled 
        public PricebookEntry pricebook {get;set;}

        public ProductConfig(Product2 prod, PricebookEntry price){
            product = prod;
            pricebook = price;
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<ProductConfig> getAllProducts(){

        //PricebookEntry.UnitPrice
        List<Product2> products = [
            SELECT Id, Family, Name, LastModifiedDate
            FROM Product2 
            WHERE IsActive = true
            ORDER BY Family ASC
            LIMIT 9999
        ];

        List<String> ids = new List<String>();

        for(Product2 product : products){
            ids.add( product.Id );
        }

        List<ProductConfig> configs = new List<ProductConfig>();


        for(Product2 product : products){
            for(PricebookEntry pricebook : [
                SELECT Id, UnitPrice, Product2Id
                FROM PricebookEntry 
                WHERE Product2Id = :ids
                ORDER BY Product2.Family ASC
                LIMIT 9999
            ] ){
                if(product.Id == pricebook.Product2Id){
                    configs.add( new ProductConfig( product, pricebook ));
                }
            }
        }

        return configs;
    }


    @AuraEnabled
    public static List<OpportunityLineItem> addOppItems(List<OpportunityLineItem> newOppItems){

        System.debug(newOppItems);
        if(newOppItems.size() == 0){return newOppItems;}

        List<OpportunityLineItem> oldOppItems = ProductManager.getExistingItems(newOppItems);
        System.debug(oldOppItems);

        List<OpportunityLineItem> updatedOppItems = new List<OpportunityLineItem>();

        for(OpportunityLineItem item : newOppItems){

            Boolean found = false;
            
            for(OpportunityLineItem oldItem : oldOppItems){
                if(oldItem.Product2Id == item.Product2Id){
                    oldItem.Quantity = item.Quantity + oldItem.Quantity;
                    updatedOppItems.add(oldItem);
                    found = true;
                    break;
                }
            }

            if(found){ continue; }

            updatedOppItems.add(item);
        }

        System.debug(updatedOppItems);

        upsert updatedOppItems;

        return ProductManager.getOppItems(newOppItems[0].OpportunityId);
    }
    
    @AuraEnabled
    public static List<OpportunityLineItem> getExistingItems(List<OpportunityLineItem> oppItems){
    
        String oppId = oppItems[0].OpportunityId;

        List<String> prodIds = new List<String>();

        for(OpportunityLineItem item : oppItems){
            prodIds.add(item.Product2Id);
        }

        return [
            SELECT Id, OpportunityId, Product2Id, Quantity, UnitPrice, Discount
            FROM OpportunityLineItem
            WHERE OpportunityId = :oppId
            AND Product2Id IN :prodIds
        ];
    }


    @AuraEnabled
    public static String updateFamily(String recordId, String family){
        
        List<Product2> ls = new List<Product2>();
        
        for(Product2 version : [
            SELECT Id, Family
            FROM Product2 
            WHERE Id = :recordId
        ]){
            version.Family = family;
            ls.add( version );
        }

        update ls;

        return 'Updated '+ls.size()+' products successfully: '+recordId+' => '+family;
    }

    @AuraEnabled
    public static List<OpportunityLineItem> deleteOppItem( String recordId ){
        
        OpportunityLineItem item = [
            SELECT Id, OpportunityId
            FROM OpportunityLineItem 
            WHERE Id = :recordId
        ];

        String oppId = item.OpportunityId;

        delete item;

        //return 'Deleted '+title+' successfully';
        return ProductManager.getOppItems(oppId);
    }


    @AuraEnabled
    public static String updateProducts( List<Product2>  prods ){

        update prods;

        return 'Updated '+prods.size()+' successfully';
    }
}