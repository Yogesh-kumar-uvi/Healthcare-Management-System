import React, { useEffect } from 'react' // ✅ FIX — useEffect import missing tha

const RazorPayComponent = () => {

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        }
    }, []);

    const openRazorpay = () => {
        // ✅ NEW — basic check
        if (!window.Razorpay) {
            alert("Payment gateway not loaded. Please refresh the page.");
            return;
        }

        var options = {
            "key": "rzp_test_2nFoeUFeOXBMIC",
            "amount": "500",
            "currency": "INR",
            "name": "HealthCare Management",
            "description": "Test Transaction",
            "image": "https://www.healthcare-management-degree.net/wp-content/uploads/2016/09/cropped-healthcare-mgmt512.png",
            "order_id": "order_Nz0y7TyPfcBXBg",
            "callback_url": "http://localhost:8080/appointment/api/v1/verify-order", // ✅ FIX — 8081 jaisa typo agar hota to bhi check kiya, 8080 hi sahi hai
            "prefill": {
                "name": "Gaurav Kumar",
                "email": "gaurav.kumar@example.com",
                "contact": "9000090000"
            },
            "notes": {
                "address": "Razorpay Corporate Office"
            },
            "theme": {
                "color": "#3399cc"
            }
        };
        try {
            var rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) { // ✅ NEW — failure handling
                console.error("Payment failed:", response.error);
                alert("Payment failed: " + response.error.description);
            });
            rzp1.open();
        } catch (error) {
            console.error("Razorpay open error:", error); // ✅ NEW
            alert("Could not open payment window. Please try again.");
        }
    };

    return (
        <>
            <button id="rzp-button1" className="btn" type="button" onClick={openRazorpay}>
                Pay with Razorpay
            </button>
        </>
    )
}

export default RazorPayComponent