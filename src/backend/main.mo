import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Text "mo:core/Text";
import OutCall "http-outcalls/outcall";
import Stripe "stripe/stripe";
import Order "mo:core/Order";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import Migration "migration";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";

// Apply migration in with clause

(with migration = Migration.run) actor {
  // ==== Types ====
  public type Service = {
    id : Nat;
    name : Text;
    priceUSD : Nat;
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

  public type ShoppingItem = {
    currency : Text;
    productName : Text;
    productDescription : Text;
    priceInCents : Nat;
    quantity : Nat;
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
    paymentStatus : PaymentStatus;
    timestamp : Time.Time;
  };

  public type ShowcaseSample = {
    file : Storage.ExternalBlob;
    description : Text;
  };

  public type ShowcaseSampleUpdate = {
    position : Nat; // Always between 1–12 for all sample categories!
    sample : ?ShowcaseSample;
  };

  public type ShowcaseCategory = {
    #businessCard;
    #logoDesign;
    #productBanner;
    #photoFrame;
  };

  public type ShowcaseSamples = {
    samples : [?ShowcaseSample];
  };
  public type AllShowcaseSamples = {
    businessCard : ShowcaseSamples;
    logoDesign : ShowcaseSamples;
    productBanner : ShowcaseSamples;
    photoFrame : ShowcaseSamples;
  };

  public type OrderStatus = {
    #pending;
    #confirmed;
    #shipped;
    #delivered;
    #cancelled;
  };

  public type PaymentStatus = {
    #pending;
    #paidSubmitted;
    #verified;
    #confirmed;
    #failed;
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

  public type ConfirmationEmailRequest = {
    customerEmail : Text;
    confirmationMessageTemplate : Text;
    orderId : Nat;
    timestamp : Time.Time;
  };

  // Stripe Types
  public type StripeConfiguration = {
    secretKey : Text;
    allowedCountries : [Text];
  };

  public type PaymentIntent = {
    id : Text;
    amount : Nat;
    currency : Text;
    status : Text;
  };

  public type CheckoutSession = {
    id : Text;
    url : Text;
    payment_intent : Text;
    payment_intent_id : Text;
  };

  // ==== State ====
  let services = Map.empty<Nat, Service>();
  let supportRequests = Map.empty<Principal, List.List<SupportRequest>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let samples = Map.empty<Text, Sample>();
  let expandedOrders = Map.empty<Nat, ExpandedOrder>();
  let notificationRequests = Map.empty<Nat, NotificationRequest>();
  let confirmationEmailRequests = Map.empty<Nat, ConfirmationEmailRequest>();

  var nextServiceId = 1;
  var nextOrderId = 1;
  var nextNotificationId = 1;
  var nextConfirmationEmailRequestId = 1;
  var stripeConfiguration : ?StripeConfiguration = null;

  var showcaseSamples : AllShowcaseSamples = {
    businessCard = { samples = Array.tabulate(12, func(_) { null }) };
    logoDesign = { samples = Array.tabulate(12, func(_) { null }) };
    productBanner = { samples = Array.tabulate(12, func(_) { null }) };
    photoFrame = { samples = Array.tabulate(12, func(_) { null }) };
  };

  // ==== Initialize authorization ====
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // ==== Showcase Samples API (12 slots for each category) ====
  public query func getAllShowcaseSamples() : async AllShowcaseSamples {
    showcaseSamples;
  };

  public query func getCategoryShowcaseSamples(category : ShowcaseCategory) : async ShowcaseSamples {
    switch (category) {
      case (#businessCard) { showcaseSamples.businessCard };
      case (#logoDesign) { showcaseSamples.logoDesign };
      case (#productBanner) { showcaseSamples.productBanner };
      case (#photoFrame) { showcaseSamples.photoFrame };
    };
  };

  public shared ({ caller }) func updateShowcaseSamples(
    category : ShowcaseCategory,
    updates : [ShowcaseSampleUpdate],
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can modify showcase samples");
    };

    let updateCategory = func(existing : ShowcaseSamples) : ShowcaseSamples {
      var updatedSamples = existing.samples;
      updates.forEach(
        func(update) {
          if (update.position < 1 or update.position > 12) {
            Runtime.trap("Invalid sample position (must be 1-12)");
          };
          updatedSamples := Array.tabulate(
            12,
            func(i) {
              if (i == update.position - 1) { update.sample } else { updatedSamples[i] };
            }
          );
        }
      );
      { samples = updatedSamples };
    };

    showcaseSamples := switch (category) {
      case (#businessCard) {
        {
          showcaseSamples with
          businessCard = updateCategory(showcaseSamples.businessCard)
        };
      };
      case (#logoDesign) {
        {
          showcaseSamples with
          logoDesign = updateCategory(showcaseSamples.logoDesign)
        };
      };
      case (#productBanner) {
        {
          showcaseSamples with
          productBanner = updateCategory(showcaseSamples.productBanner)
        };
      };
      case (#photoFrame) {
        {
          showcaseSamples with
          photoFrame = updateCategory(showcaseSamples.photoFrame)
        };
      };
    };
  };

  // ==== Add Service ====
  public shared ({ caller }) func addService(
    name : Text,
    priceUSD : Nat,
    deliveryTime : Text,
  ) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can add services");
    };
    let id = nextServiceId;
    let service : Service = { id; name; priceUSD; deliveryTime };
    services.add(id, service);
    nextServiceId += 1;
    id;
  };

  // Services should be viewable by anyone (including guests) for browsing
  public query func getServices() : async [Service] {
    services.values().toArray().sort();
  };

  // ==== User Profile Functions ====
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

  // ==== Basic Profile Flow for Account Creation ====
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

  // ==== Support Requests ====
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

  // ==== Sample Management ====
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

  // Samples should be viewable by anyone (including guests) for product selection
  public query func getSamples() : async [Sample] {
    samples.values().toArray();
  };

  // ==== Updated Add to Cart (Create Expanded Order) ====
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
      paymentStatus = #pending;
      timestamp = Time.now();
    };
    expandedOrders.add(id, order);
    nextOrderId += 1;
    id;
  };

  // ==== Stripe Payment Integration (New Section) ====
  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can configure Stripe");
    };
    stripeConfiguration := ?config;
  };

  func getStripeConfiguration() : StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check Stripe session status");
    };
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // ==== Payment and Order Status Updates ====
  public shared ({ caller }) func updateOrderPaymentStatus(orderId : Nat, status : PaymentStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update payment status");
    };
    switch (expandedOrders.get(orderId)) {
      case (null) {
        Runtime.trap("Order not found");
      };
      case (?order) {
        // Users can only update their own orders
        if (order.owner != caller) {
          Runtime.trap("Unauthorized: Can only update payment status for your own orders");
        };
        // Users can only set status to #paidSubmitted (indicating they submitted payment)
        switch (status) {
          case (#paidSubmitted) {
            let updatedOrder = {
              order with
              paymentStatus = #paidSubmitted;
              orderStatus = #confirmed;
            };
            expandedOrders.add(orderId, updatedOrder);
          };
          case (_) {
            Runtime.trap("Unauthorized: Users can only mark orders as paidSubmitted. Other payment status changes require admin verification.");
          };
        };
      };
    };
  };

  public shared ({ caller }) func submitConfirmationEmailRequest(orderId : Nat, customerEmail : Text, confirmationMessageTemplate : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit email confirmation requests");
    };
    switch (expandedOrders.get(orderId)) {
      case (null) {
        Runtime.trap("Order not found");
      };
      case (?order) {
        if (order.owner != caller) {
          Runtime.trap("Unauthorized: Can only submit confirmation requests for your own orders");
        };
        if (order.paymentStatus == #paidSubmitted) {
          let requestId = nextConfirmationEmailRequestId;
          let request : ConfirmationEmailRequest = {
            customerEmail;
            confirmationMessageTemplate;
            orderId;
            timestamp = Time.now();
          };
          confirmationEmailRequests.add(requestId, request);
          nextConfirmationEmailRequestId += 1;
        } else {
          Runtime.trap("Order must have payment status 'paidSubmitted' to submit confirmation email request");
        };
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

  // ==== New: Admin-Only Payment Verification + Confirmation ====
  public shared ({ caller }) func verifyPaymentAndConfirmOrder(orderId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can verify payments and confirm orders");
    };

    switch (expandedOrders.get(orderId)) {
      case (null) {
        Runtime.trap("Order not found");
      };
      case (?order) {
        if (order.paymentStatus == #paidSubmitted) {
          let updatedOrder = {
            order with
            paymentStatus = #verified;
            orderStatus = #confirmed;
          };
          expandedOrders.add(orderId, updatedOrder);

          // Store notification request
          let notificationId = nextNotificationId;
          let request : NotificationRequest = {
            name = order.name;
            email = order.email;
            phone = order.phone;
            product = order.product;
            sample = order.sampleSelected;
            brandName = order.brandName;
            description = order.description;
            timestamp = Time.now();
          };
          notificationRequests.add(notificationId, request);
          nextNotificationId += 1;
        } else {
          Runtime.trap("Order is not in a state that can be verified and confirmed");
        };
      };
    };
  };

  // ==== Order Status Management ====
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

  // ==== Admin-only functions to manage notification requests ====
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

  // ==== Admin-only functions to manage confirmation email requests ====
  public query ({ caller }) func getAllConfirmationEmailRequests() : async [ConfirmationEmailRequest] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can view confirmation email requests");
    };
    confirmationEmailRequests.values().toArray();
  };

  // Deprecated, replaced by confirmation email flow
  public query ({ caller }) func getConfirmationMessageTemplate() : async Text {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can get confirmation message template");
    };
    "Thank you for your order, {customer_name}! Your order ID is {order_id}. ...";
  };

  // ==== New: Cancel Order (24 hours restriction) ====
  public shared ({ caller }) func cancelOrder(orderId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cancel orders");
    };

    switch (expandedOrders.get(orderId)) {
      case (null) {
        Runtime.trap("Order not found");
      };
      case (?order) {
        // Verify caller is the order owner
        if (order.owner != caller) {
          Runtime.trap("Unauthorized: Can only cancel your own orders");
        };

        // Verify 24-hour time window (nanoseconds to hours conversion)
        let hoursSinceOrder = (Time.now() - order.timestamp) / (1_000_000_000 * 3600);
        if (hoursSinceOrder > 24) {
          Runtime.trap("Orders can only be cancelled within 24 hours of creation");
        };

        // Update order status to cancelled (preserve all other fields)
        let updatedOrder = { order with orderStatus = #cancelled };
        expandedOrders.add(orderId, updatedOrder);
      };
    };
  };
};
