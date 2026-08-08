const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {Users,Salons,Services,Appointments,Staff,Reviews} = require('../models');
const {Sequelize,DataTypes, where,Op} = require('sequelize');
const { sequelize } = require('../models');

const getReviewForm = async (req,res) => {
    res.sendFile(path.join(__dirname, '../', 'views', 'review.html'));
}

const postReview = async (req, res) => {
  
    const t = await sequelize.transaction();

    try {
        
        const {appointmentId,rating,comment} = req.body;

        if (!appointmentId || !rating || !comment) {
            return res.status(400).json({message: 'Appointment, rating and comment are required'});
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({message: 'Rating must be between 1 and 5'});
        }

        const appointment = await Appointments.findOne({
            where: {
                id: appointmentId,
                userId: req.user.id,
                status: 'completed',
                paymentStatus: 'paid'
            }
        });

        if (!appointment) {
            return res.status(404).json({message: 'Only completed paid appointments can be reviewed'});
        }

        const existingReview = await Reviews.findOne({
            where: {
                appointmentId
            }
        });

        if (existingReview) {
            return res.status(409).json({message: 'You have already reviewed this appointment'});
        }

        const review = await Reviews.create({
            appointmentId,
            userId: req.user.id,
            rating,
            comment
        },{transaction : t});

        await t.commit();

        res.status(201).json({message: 'Review submitted successfully',review});

    } catch (error) {
        console.log('ERROR CREATING REVIEW --->', error);
        await t.rollback();
        res.status(500).json({message: 'Could not submit review'});
    }
};

const respondToReview = async (req, res) => {
  
    const t = await sequelize.transaction();

    try {
    const { id } = req.params;
    const { staffResponse } = req.body;

    if (!staffResponse || !staffResponse.trim()) {
      return res.status(400).json({message: 'Response is required'});
    }

    const salon = await Salons.findOne({
      where: {
        adminId: req.user.id
      }
    });

    if (!salon) {
      return res.status(404).json({message: 'Salon not found'});
    }

    const review = await Reviews.findOne({
      where: {
        id
      },
      include: [
        {
          model: Appointments,
          as: 'appointment',
          where: {
            salonId: salon.id
          }
        }
      ]
    });

    if (!review) {
      return res.status(404).json({message: 'Review not found'});
    }

    review.staffResponse = staffResponse.trim();
    review.respondedAt = new Date();
     
    await review.save({transaction : t});
    await t.commit();

    res.json({message: 'Response added successfully',review});

  } catch (error) {
    console.log('ERROR RESPONDING TO REVIEW --->', error);

    res.status(500).json({message: 'Could not respond to review'});
  }
};

const editReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        message: 'Rating and comment are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: 'Rating must be between 1 and 5'
      });
    }

    const review = await Reviews.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!review) {
      return res.status(404).json({
        message: 'Review not found'
      });
    }

    if (review.staffResponse) {
      return res.status(400).json({
        message: 'Cannot edit review after staff has responded'
      });
    }

    review.rating = rating;
    review.comment = comment;

    await review.save();

    res.status(200).json({
      message: 'Review updated successfully',
      review
    });

  } catch (error) {
    console.log('ERROR EDITING REVIEW --->', error);
    res.status(500).json({
      message: 'Could not edit review'
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Reviews.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!review) {
      return res.status(404).json({
        message: 'Review not found'
      });
    }

    if (review.staffResponse) {
      return res.status(400).json({
        message: 'Cannot delete review after staff has responded'
      });
    }

    await review.destroy();

    res.status(200).json({
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.log('ERROR DELETING REVIEW --->', error);
    res.status(500).json({
      message: 'Could not delete review'
    });
  }
};

module.exports= {
    getReviewForm,
    postReview,
    respondToReview,
    editReview,
    deleteReview
}