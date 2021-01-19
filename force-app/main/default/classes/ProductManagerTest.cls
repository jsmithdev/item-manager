@IsTest
public with sharing class ProductManagerTest {

    @isTest
    public static void doProductManagerTest(){

        Product2 prd = new Product2(
            Name = 'Test'
        );
        insert prd;

        List<Product2> ls = ProductManager.getAllProducts();
        
        ProductManager.updateFamily(prd.Id, 'Test');

        ProductManager.updateProducts( ls );

        ProductManager.deleteProduct(prd.Id);
    }
}
