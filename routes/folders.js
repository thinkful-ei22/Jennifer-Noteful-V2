'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex');

//get all folders
router.get('/', (req, res, next) => {
  knex.select('id', 'name')
    .from('folders')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

//Get a single folder
router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  knex('folders')
    .select('folders.id', 'name')
    .where('folders.id', `${id}`)
    .then(results => {
      res.json(results[0]);})
    .catch(err => {
      next(err);
    });
});
  
//  Put update an item
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  
  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['name'];
  
  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });
  
  /***** Never trust users - validate input *****/
  if (!updateObj.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  
  knex('folders')
    .update({name:`${updateObj.name}`})
    .where('id', `${id}`)
    .then(results => {
      res.json(results);})
    .catch(err => {
      next(err);
    });
});
  
// Post (insert) an item
router.post('/', (req, res, next) => {
  const {name} = req.body;
  
  const newFolder = { name };
  /***** Never trust users - validate input *****/
  if (!newFolder.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  
  knex
    .insert({name: `${newFolder.name}`})
    .into('folders')
    .returning('id', 'name')
    .then(results => {
      res.json(results);})
    .catch(err => {
      next(err);
    });
});
  
// Delete an item
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  
  knex('folders')
    .where('folders.id', `${id}`)
    .del()
    .then(()=>{
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
});
  

  





module.exports = router;