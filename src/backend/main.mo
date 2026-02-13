import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import List "mo:core/List";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  public type Service = {
    id : Nat;
    name : Text;
    priceRange : Text;
    deliveryTime : Text;
  };

  module Service {
    public func compare(s1 : Service, s2 : Service) : Order.Order {
      Nat.compare(s1.id, s2.id);
    };
  };

  public type SupportRequest = {
    timestamp : Time.Time;
    name : Text;
    email : Text;
    message : Text;
  };

  module SupportRequest {
    public func compare(r1 : SupportRequest, r2 : SupportRequest) : Order.Order {
      Int.compare(r1.timestamp, r2.timestamp);
    };
  };

  public type Gender = { #male; #female; #other };

  public type UserProfile = {
    fullName : Text;
    email : Text;
    mobileNumber : Text;
    dob : Text;
    gender : Gender;
    isVerified : Bool;
  };

  public type Sample = {
    sampleName : Text;
    description : Text;
    price : Text;
    concentration : Text;
  };

  public type ExpandedOrder = {
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

  public type OrderStatus = {
    #pending;
    #confirmed;
    #shipped;
    #delivered;
    #cancelled;
  };

  public type BasicProfile = {
    fullName : Text;
    email : Text;
  };

  module ExpandedOrder {
    public func compare(o1 : ExpandedOrder, o2 : ExpandedOrder) : Order.Order {
      Int.compare(o1.timestamp, o2.timestamp);
    };
  };

  public type NotificationRequest = {
    name : Text;
    email : Text;
    phone : Text;
    product : Text;
    sample : Text;
    brandName : Text;
    description : Text;
    timestamp : Time.Time;
  };

  public type AddToCartInput = {
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
  };

  // State
  let services = Map.empty<Nat, Service>();
  let supportRequests = Map.empty<Principal, List.List<SupportRequest>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let samples = Map.empty<Text, Sample>();
  let expandedOrders = Map.empty<Nat, ExpandedOrder>();
  let notificationRequests = Map.empty<Nat, NotificationRequest>();

  // Initialize authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var nextServiceId = 1;
  var nextOrderId = 1;
  var nextNotificationId = 1;

  // Add Service
  public shared ({ caller }) func addService(name : Text, priceRange : Text, deliveryTime : Text) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can add services");
    };
    let id = nextServiceId;
    let service : Service = {
      id;
      name;
      priceRange;
      deliveryTime;
    };
    services.add(id, service);
    nextServiceId += 1;
    id;
  };

  public query func getServices() : async [Service] {
    services.values().toArray().sort();
  };

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Basic Profile Flow for Account Creation
  public shared ({ caller }) func saveBasicProfile(basicProfile : BasicProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create basic profiles");
    };
    let extendedProfile : UserProfile = {
      fullName = basicProfile.fullName;
      email = basicProfile.email;
      mobileNumber = "";
      dob = "";
      gender = #other;
      isVerified = false;
    };
    userProfiles.add(caller, extendedProfile);
  };

  // Support Requests
  public shared ({ caller }) func submitSupportRequest(name : Text, email : Text, message : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit support requests");
    };
    let request : SupportRequest = {
      timestamp = Time.now();
      name;
      email;
      message;
    };
    let currentRequests = switch (supportRequests.get(caller)) {
      case (null) { List.empty<SupportRequest>() };
      case (?current) { current };
    };
    currentRequests.add(request);
    supportRequests.add(caller, currentRequests);
  };

  public query ({ caller }) func getSupportRequests() : async [SupportRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view support requests");
    };
    switch (supportRequests.get(caller)) {
      case (null) { [] };
      case (?requests) { requests.toArray().sort() };
    };
  };

  // Sample Management
  public shared ({ caller }) func addSample(
    sampleName : Text,
    description : Text,
    price : Text,
    concentration : Text,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can add samples");
    };
    let sample : Sample = {
      sampleName;
      description;
      price;
      concentration;
    };
    samples.add(sampleName, sample);
  };

  public query ({ caller }) func getSamples() : async [Sample] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view samples");
    };
    samples.values().toArray();
  };

  // Updated Add to Cart (Create Expanded Order)
  public shared ({ caller }) func addToCart(input : AddToCartInput) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };
    let id = nextOrderId;
    let order : ExpandedOrder = {
      id;
      owner = caller;
      name = input.name;
      email = input.email;
      phone = input.phone;
      dob = input.dob;
      gender = input.gender;
      product = input.product;
      sampleSelected = input.sampleSelected;
      brandName = input.brandName;
      description = input.description;
      price = input.price;
      deliveryTime = input.deliveryTime;
      orderStatus = #pending;
      paymentStatus = "Pending";
      timestamp = Time.now();
    };
    expandedOrders.add(id, order);
    nextOrderId += 1;

    // Store notification request
    let notificationId = nextNotificationId;
    let request : NotificationRequest = {
      name = input.name;
      email = input.email;
      phone = input.phone;
      product = input.product;
      sample = input.sampleSelected;
      brandName = input.brandName;
      description = input.description;
      timestamp = Time.now();
    };
    notificationRequests.add(notificationId, request);
    nextNotificationId += 1;

    id;
  };

  public shared ({ caller }) func updateOrderPaymentStatus(orderId : Nat, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update payment status");
    };
    switch (expandedOrders.get(orderId)) {
      case (null) {
        Runtime.trap("Order not found");
      };
      case (?order) {
        if (order.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update payment status for your own orders");
        };
        let updatedOrder = { order with paymentStatus = status };
        expandedOrders.add(orderId, updatedOrder);
      };
    };
  };

  public query ({ caller }) func getCallerOrders() : async [ExpandedOrder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    expandedOrders.values().toArray().filter(
      func(order) { order.owner == caller }
    ).sort();
  };

  public query ({ caller }) func getCustomerOrders(customerName : Text) : async [ExpandedOrder] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can view customer orders by name");
    };
    expandedOrders.values().toArray().filter(
      func(order) { Text.equal(order.name, customerName) }
    ).sort();
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : OrderStatus) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can update order status");
    };
    switch (expandedOrders.get(orderId)) {
      case (null) {
        Runtime.trap("Order not found");
      };
      case (?order) {
        let updatedOrder = { order with orderStatus = status };
        expandedOrders.add(orderId, updatedOrder);
      };
    };
  };

  public query ({ caller }) func getOrdersByStatus(status : OrderStatus) : async [ExpandedOrder] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can view orders by status");
    };
    expandedOrders.values().toArray().filter(
      func(order) { order.orderStatus == status }
    ).sort();
  };

  // Admin-only functions to manage notification requests
  public query ({ caller }) func getAllNotificationRequests() : async [NotificationRequest] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can view notification requests");
    };
    notificationRequests.values().toArray();
  };

  public shared ({ caller }) func deleteNotificationRequest(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can delete notification requests");
    };
    notificationRequests.remove(id);
  };
};
