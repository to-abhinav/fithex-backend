const Member = require("../models/Members");

const addMember = async (req,res) =>{
    try {
        const {userId, subscriptionPlan, subscriptionMonths, expiryDate} = req.body;
         const member = await Member.create({
            userId,
            subscriptionPlan,
            subscriptionMonths,
            expiryDate,
            gymId:req.user
                  
         })
    } catch (error) {
        
    }
}