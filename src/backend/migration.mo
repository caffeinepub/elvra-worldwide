import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  type Service = {
    id : Nat;
    name : Text;
    priceUSD : Nat;
    deliveryTime : Text;
  };

  type SupportRequest = {
    timestamp : Time.Time;
    name : Text;
    email : Text;
    message : Text;
  };

  type Gender = { #male; #female; #other };

  type UserProfile = {
    fullName : Text;
    email : Text;
    mobileNumber : Text;
    dob : Text;
    gender : Gender;
    isVerified : Bool;
  };

  type Sample = {
    sampleName : Text;
    description : Text;
    price : Text;
    concentration : Text;
  };

  type ExpandedOrder = {
    id : Nat;
    owner : Principal.Principal;
    name : Text;
    email : Text;
    phone : Text;
    dob : Text;
    gender : Gender;
    product : Text;
    sampleSelected : Text;
    brandName : Text;
    description : Text;
    price : Text;
    deliveryTime : Text;
    orderStatus : OrderStatus;
    paymentStatus : PaymentStatus;
    timestamp : Time.Time;
  };

  type OrderStatus = {
    #pending;
    #confirmed;
    #shipped;
    #delivered;
    #cancelled;
  };

  type PaymentStatus = {
    #pending;
    #paidSubmitted;
    #verified;
    #confirmed;
    #failed;
  };

  type NotificationRequest = {
    name : Text;
    email : Text;
    phone : Text;
    product : Text;
    sample : Text;
    brandName : Text;
    description : Text;
    timestamp : Time.Time;
  };

  type ConfirmationEmailRequest = {
    customerEmail : Text;
    confirmationMessageTemplate : Text;
    orderId : Nat;
    timestamp : Time.Time;
  };

  type OldActor = {
    services : Map.Map<Nat, Service>;
    supportRequests : Map.Map<Principal.Principal, List.List<SupportRequest>>;
    userProfiles : Map.Map<Principal.Principal, UserProfile>;
    samples : Map.Map<Text, Sample>;
    expandedOrders : Map.Map<Nat, ExpandedOrder>;
    notificationRequests : Map.Map<Nat, NotificationRequest>;
    confirmationEmailRequests : Map.Map<Nat, ConfirmationEmailRequest>;
    nextServiceId : Nat;
    nextOrderId : Nat;
    nextNotificationId : Nat;
    nextConfirmationEmailRequestId : Nat;
  };

  type NewActor = {
    services : Map.Map<Nat, Service>;
    supportRequests : Map.Map<Principal.Principal, List.List<SupportRequest>>;
    userProfiles : Map.Map<Principal.Principal, UserProfile>;
    samples : Map.Map<Text, Sample>;
    expandedOrders : Map.Map<Nat, ExpandedOrder>;
    notificationRequests : Map.Map<Nat, NotificationRequest>;
    confirmationEmailRequests : Map.Map<Nat, ConfirmationEmailRequest>;
    nextServiceId : Nat;
    nextOrderId : Nat;
    nextNotificationId : Nat;
    nextConfirmationEmailRequestId : Nat;
    stripeConfiguration : ?{ secretKey : Text; allowedCountries : [Text] };
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      stripeConfiguration = null;
    };
  };
};
