'use strict';

const express = require('express');
const router = express.Router();
const knex = require('../knex');

//create tag
router.post('/', (req, res, next) => {
  const { name } = req.body;
  
  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  
  const newItem = { name };
  
  knex.insert(newItem)
    .into('tags')
    .returning(['id', 'name'])
    .then((results) => {
      const result = results[0];
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => next(err));
});

//get all tags
router.get('/', (req, res, next) => {
  knex.select('id', 'name')
    .from('tags')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

//Get a single tag
router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  knex('tags')
    .select('tags.id', 'name')
    .where('tags.id', `${id}`)
    .then(results => {
      res.json(results[0]);})
    .catch(err => {
      next(err);
    });
});

//update tags
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const {name} = req.body;
  const updatedTag = {name: name};
  
  
  if (!updatedTag.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  
  knex('tags')
    .update(updatedTag)
    .where('id', id)
    .returning(['name', 'id'])
    .then(([item]) => {
      res.json(item);})
    .catch(err => {
      next(err);
    });
});

//delete a tag
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
    
  knex('tags')
    .where('tags.id', `${id}`)
    .del()
    .then(()=>{
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;