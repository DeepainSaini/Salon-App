const path = require('path');
const {Appointments,Reviews} = require('../models');
const { sequelize } = require('../models');
const asyncHandler = require('../util/asyncHandler');

const getReviewForm = async (req,res) => {
    res.sendFile(path.join(__dirname, '../', 'views', 'review.html'));
}

const postReview = asyncHandler(async (req, res) => {
  
    const t = await sequelize.transaction();

    try {
        
        const {appointmentId,rating,comment} = req.body;

        if (!appointmentId || !rating || !comment) {
            await t.rollback();
            return res.status(400).json({message: 'Appointment, rating and comment are required'});
        }

        if (rating < 1 || rating > 5) {
            await t.rollback();
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
            await t.rollback();
            return res.status(404).json({message: 'Only completed paid appointments can be reviewed'});
        }

        const existingReview = await Reviews.findOne({
            where: {
                appointmentId
            }
        });

        if (existingReview) {
            await t.rollback();
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
        await t.rollback();
        throw error;
    }
});

const editReview = asyncHandler(async (req, res) => {
  
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      await t.rollback();
      return res.status(400).json({
        message: 'Rating and comment are required'
      });
    }

    if (rating < 1 || rating > 5) {
      await t.rollback();
      return res.status(400).json({
        message: 'Rating must be between 1 and 5'
      });
    }

    const review = await Reviews.findOne({
      where: {
        id,
        userId: req.user.id
      },transaction:t
    });

    if (!review) {
      await t.rollback();
      return res.status(404).json({
        message: 'Review not found'
      });
    }

    if (review.staffResponse) {
      await t.rollback();
      return res.status(400).json({
        message: 'Cannot edit review after staff has responded'
      });
    }

    review.rating = rating;
    review.comment = comment;

    await review.save({transaction:t});
    await t.commit();

    res.status(200).json({
      message: 'Review updated successfully',
      review
    });

  } catch (error) {
    await t.rollback();
    throw error;
  }
});

const deleteReview = asyncHandler(async (req, res) => {
  
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    const review = await Reviews.findOne({
      where: {
        id,
        userId: req.user.id
      },transaction:t
    });

    if (!review) {
      await t.rollback();
      return res.status(404).json({
        message: 'Review not found'
      });
    }

    if (review.staffResponse) {
      await t.rollback();
      return res.status(400).json({
        message: 'Cannot delete review after staff has responded'
      });
    }

    await review.destroy({transaction:t});
    await t.commit();

    res.status(200).json({
      message: 'Review deleted successfully'
    });

  } catch (error) {
    await t.rollback();
    throw error;
  }
});

module.exports= {
    getReviewForm,
    postReview,
    editReview,
    deleteReview
}
