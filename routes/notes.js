'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();


const knex = require('../knex');

// Get All (and search by query)
router.get('/', (req, res, next) => {
  const { searchTerm , folderId} = req.query;
  
  knex
    .select('notes.id', 'title', 'content','folders.id as folderId', 'folders.name as folderName')
    .from('notes')
    .leftJoin('folders','notes.folder_id', 'folders.id')
    .modify(queryBuilder => {
      if (searchTerm) {
        queryBuilder.where('title', 'like', `%${searchTerm}%`);
      }
    })
    .modify(queryBuilder=>{
      if(folderId){
        queryBuilder.where('folder_id', folderId);
      }
    })
    .orderBy('notes.id')
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

// Get a single item
router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  knex('notes')
    .select('notes.id', 'title', 'content','folders.id as folderId', 'folders.name as folderName')
    .where('notes.id', `${id}`)
    .leftJoin('folders','notes.folder_id', 'folders.id')
    .then(results => {
      res.json(results[0]);})
    .catch(err => {
      next(err);
    });
});

// Put update an item
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const {title, content, folderId} = req.body;
  const updatedNote = {title: title, content: content, folder_id: folderId};


  if (!updatedNote.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex('notes')
    .update(updatedNote)
    .where('notes.id', id)
    .returning(['id', 'title', 'content', 'folder_id'])
    .then(([item]) => {
      res.json(item);})
    .catch(err => {
      next(err);
    });
});

// Post (insert) an item
router.post('/', (req, res, next) => {
  const { title, content, folderId } = req.body;

  const newItem = { 
    title: title,
    content: content,
    folder_id: folderId };
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  let noteId;

  knex
    .insert(newItem)
    .into('notes')
    .returning('id')
    .then(([id]) => {
      noteId =id;
      return knex.select('notes.id', 'title', 'content', 'folder_id as folderId', 'folders.name as folderName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .where('notes.id', noteId);
    })
    .then(([results]) => {
      res.location(`${req.originalUrl}/${results.id}`).status(201).json(results);
    })
    .catch(err => {
      next(err);
    });
});

// Delete an item
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  knex('notes')
    .where('id', `${id}`)
    .del()
    .then(results=>{
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
