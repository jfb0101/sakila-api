CREATE DEFINER=`root`@`localhost` PROCEDURE `sakila`.`film_in_stock`(IN p_film_id INT, IN p_store_id INT)
    READS SQL DATA
BEGIN
     SELECT inventory_id
     FROM inventory
     WHERE film_id = p_film_id
     AND store_id = p_store_id
     AND inventory_in_stock(inventory_id);

     
END