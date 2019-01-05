const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

/*
|--------------------------------------------------------------------------
| LOAD VALIDATION
|--------------------------------------------------------------------------
*/

const validateProfileInput = require('../../validation/profile');

/*
|--------------------------------------------------------------------------
| LOAD PROFILE MODEL
|--------------------------------------------------------------------------
*/

const Profile = require('../../models/Profile');

/*
|--------------------------------------------------------------------------
| LOAD USER PROFILE
|--------------------------------------------------------------------------
*/

const User = require('../../models/User');

/*
|--------------------------------------------------------------------------
| @route    GET api/profile
| @desc     Get current user's profile
| @access   Protected
|--------------------------------------------------------------------------
*/

router.get(
    '/',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const errors = {};

        Profile.findOne({ user: req.user.id })
            .populate('user', ['name', 'avatar'])
            .then(profile => {
                if (!profile) {
                    errors.noprofile = 'There is no profile for this user';
                    return res.status(404).json(errors);
                }
                res.json(profile);
            })
            .catch(err => res.status(404).json(err));
    }
);

/*
|--------------------------------------------------------------------------
| @route    POST api/profile
| @desc     Create or edit user profile
| @access   Protected
|--------------------------------------------------------------------------
*/

router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const { errors, isValid } = validateProfileInput(req.body);
        /*
        |--------------------------------------------------------------------------
        | CHECK VALIDATION
        |--------------------------------------------------------------------------
        */
        if (!isValid) {
            return res.status(400).json(errors);
        }
        /*
        |--------------------------------------------------------------------------
        | GET FIELDS
        |--------------------------------------------------------------------------
        */
        const profileFields = {};
        profileFields.user = req.user.id;

        if (req.body.handle) profileFields.handle = req.body.handle;
        if (req.body.company) profileFields.company = req.body.company;
        if (req.body.website) profileFields.website = req.body.website;
        if (req.body.location) profileFields.location = req.body.location;
        if (req.body.bio) profileFields.bio = req.body.bio;
        if (req.body.status) profileFields.status = req.body.status;
        if (req.body.githubusername)
            profileFields.githubusername = req.body.githubusername;
        /*
        |--------------------------------------------------------------------------
        | SKILLS - SPLIT INTO ARRAY
        |--------------------------------------------------------------------------
        */
        if (typeof req.body.skills !== 'undefined') {
            profileFields.skills = req.body.skills.split(', ');
        }
        /*
        |--------------------------------------------------------------------------
        | SOCIAL MEDIA
        |--------------------------------------------------------------------------
        */
        profileFields.social = {};
        if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
        if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
        if (req.body.facebook)
            profileFields.social.facebook = req.body.facebook;
        if (req.body.linkedin)
            profileFields.social.linkedin = req.body.linkedin;
        if (req.body.instagram)
            profileFields.social.instagram = req.body.instagram;

        Profile.findOne({ user: req.user.id }).then(profile => {
            if (profile) {
                /*
                |--------------------------------------------------------------------------
                | UPDATE
                |--------------------------------------------------------------------------
                */
                Profile.findByIdAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true }
                ).then(profile => res.json(profile));
            } else {
                /*
                |--------------------------------------------------------------------------
                | CREATE
                |--------------------------------------------------------------------------
                */
                /*
                |--------------------------------------------------------------------------
                | CHECK IF HANDLE EXISTS
                |--------------------------------------------------------------------------
                */
                Profile.findOne({ handle: profileFields.handle }).then(
                    profile => {
                        if (profile) {
                            errors.handle = 'that handle already exists';
                            res.status(400).json(errors);
                        }
                        /*
                        |--------------------------------------------------------------------------
                        | SAVE PROFILE
                        |--------------------------------------------------------------------------
                        */
                        new Profile(profileFields)
                            .save()
                            .then(profile => res.json(profile));
                    }
                );
            }
        });
    }
);

module.exports = router;
