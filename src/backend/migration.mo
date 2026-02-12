import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  type Service = {
    id : Nat;
    name : Text;
    priceRange : Text;
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

  type OrderStatus = { #pending; #confirmed; #shipped; #delivered; #cancelled };

  type CustomerOrder = {
    id : Nat;
    owner : Principal;
    name : Text;
    email : Text;
    phone : Text;
    dob : Text;
    gender : Gender;
    selectedSample : Text;
    orderStatus : OrderStatus;
    timestamp : Time.Time;
  };

  type ExpandedOrder = {
    id : Nat;
    owner : Principal;
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
    paymentStatus : Text;
    timestamp : Time.Time;
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

  type OldActor = {
    services : Map.Map<Nat, Service>;
    supportRequests : Map.Map<Principal, List.List<SupportRequest>>;
    userProfiles : Map.Map<Principal, UserProfile>;
    samples : Map.Map<Text, Sample>;
    customerOrders : Map.Map<Nat, CustomerOrder>;
    nextServiceId : Nat;
    nextOrderId : Nat;
  };

  type NewActor = {
    services : Map.Map<Nat, Service>;
    supportRequests : Map.Map<Principal, List.List<SupportRequest>>;
    userProfiles : Map.Map<Principal, UserProfile>;
    samples : Map.Map<Text, Sample>;
    expandedOrders : Map.Map<Nat, ExpandedOrder>;
    notificationRequests : Map.Map<Nat, NotificationRequest>;
    nextServiceId : Nat;
    nextOrderId : Nat;
    nextNotificationId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let expandedOrders = old.customerOrders.map<Nat, CustomerOrder, ExpandedOrder>(
      func(_id, oldOrder) {
        {
          id = oldOrder.id;
          owner = oldOrder.owner;
          name = oldOrder.name;
          email = oldOrder.email;
          phone = oldOrder.phone;
          dob = oldOrder.dob;
          gender = oldOrder.gender;
          product = "Unknown";
          sampleSelected = oldOrder.selectedSample;
          brandName = "Unknown";
          description = "No description";
          price = "0";
          deliveryTime = "Unknown";
          orderStatus = oldOrder.orderStatus;
          paymentStatus = "Pending";
          timestamp = oldOrder.timestamp;
        };
      }
    );
    {
      old with
      expandedOrders;
      notificationRequests = Map.empty<Nat, NotificationRequest>();
      nextNotificationId = 1;
    };
  };
};
