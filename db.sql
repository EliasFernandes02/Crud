create database db_teste;

use db_teste;

CREATE TABLE tb_teste(
    ID varchar(100),
    name varchar(255),
    email varchar(255),
    password varchar(255)
);

INSERT INTO tb_teste (ID,name,email,password)
VALUES ('1','elias','elias@gmail.com','1234');
