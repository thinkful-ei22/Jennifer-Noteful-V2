'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

const hydrateNotes = require('../utils/hydrateNotes');
const knex = require('../knex');

// Get All (and search by query)
router.get('/', (req, res, next) => {
  const { searchTerm , folderId, tagId} = req.query;
  
  knex
    .select('notes.id', 'title', 'content','folders.id as folderId', 'folders.name as folderName','tags.id as tagId', 'tags.name as tagName')
    .from('notes')
    .leftJoin('folders','notes.folder_id', 'folders.id')//LEFT JOIN folders ON notes.folder_id = folders.id
    .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')//LEFT JOIN notes_tags ON notes.id = notes_tags.note_id
    .leftJoin('tags', 'notes_tags.tag_id', 'tags.id')//LEFT JOIN tags ON notes_tags.tag_id = tags.id
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
    .modify(queryBuilder => {
      if (tagId) {
        queryBuilder.where('tag_id', tagId);
      }
    })
    .orderBy('notes.id')
    .then(result => {
      if (result) {
        const hydrated = hydrateNotes(result);
        res.json(hydrated);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

// Get a single item
router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  knex('notes')
    .select('notes.id', 'title', 'content','folders.id as folderId', 'folders.name as folderName', 'tags.id as tagId', 'tags.name as tagNme')
    .where('notes.id', `${id}`)
    .leftJoin('folders','notes.folder_id', 'folders.id')//LEFT JOIN folders ON notes.folder_id = folders.id
    .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')//LEFT JOIN notes_tags ON notes.id = notes_tags.note_id
    .leftJoin('tags', 'notes_tags.tag_id', 'tags.id')//LEFT JOIN tags ON notes_tags.tag_id = tags.id
    .then(results => {
      if (results) {
        // const result = results[0];
        const hydrated = hydrateNotes(results);
        res.json(hydrated[0]);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

// Put update an item

router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const {title, content, folderId, tags} = req.body;
  const updatedNote = {
    title: title, 
    content: content, 
    folder_id: folderId
  };


  if (!updatedNote.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex('notes')
    .update(updatedNote)
    .where('notes.id', id)
    .returning('id')
    .then(()=>{
      return knex('notes_tags')
        .where('note_id', id)
        .del();
    }
    )
    .then(()=>{
      const tagsInsert = tags.map(tagId => ({ note_id: id, tag_id: tagId }));
      return knex.insert(tagsInsert).into('notes_tags');
    })
    .then(()=>{
      return knex.select('notes.id', 'title', 'content',
        'folders.id as folder_id', 'folders.name as folderName',
        'tags.id as tagId', 'tags.name as tagName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
        .leftJoin('tags', 'tags.id', 'notes_tags.tag_id')
        .where('notes.id', id);
    })
    .then(result => {
      if (result) {
        // Hydrate the results
        const hydrated = hydrateNotes(result)[0];
        res.status(200).json(hydrated);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

// Post (insert) an item
router.post('/', (req, res, next) => {
  const { title, content, folderId, tags} = req.body;

  const newItem = { 
    title: title,
    content: content,
    folder_id: folderId,
  };
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  let noteId;
  // Insert new note into notes table
  knex.insert(newItem).into('notes').returning('id')
    .then(([id]) => {
    // Insert related tags into notes_tags table
      noteId = id;
      const tagsInsert = tags.map(tagId => ({ note_id: noteId, tag_id: tagId }));
      return knex.insert(tagsInsert).into('notes_tags');
    })
    .then(() => {
    // Select the new note and leftJoin on folders and tags
      return knex.select('notes.id', 'title', 'content',
        'folders.id as folder_id', 'folders.name as folderName',
        'tags.id as tagId', 'tags.name as tagName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
        .leftJoin('tags', 'tags.id', 'notes_tags.tag_id')
        .where('notes.id', noteId);
    })
    .then(result => {
      if (result) {
      // Hydrate the results
        const hydrated = hydrateNotes(result)[0];
        // Respond with a location header, a 201 status and a note object
        res.location(`${req.originalUrl}/${hydrated.id}`).status(201).json(hydrated);
      } else {
        next();
      }
    })
    .catch(err => next(err));

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
