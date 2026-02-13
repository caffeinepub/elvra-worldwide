import Array "mo:core/Array";
import Storage "blob-storage/Storage";

module {
  public type OldShowcaseSamples = {
    sample1 : ?ShowcaseSample;
    sample2 : ?ShowcaseSample;
    sample3 : ?ShowcaseSample;
    sample4 : ?ShowcaseSample;
  };

  public type OldActor = {
    bannerSamples : OldShowcaseSamples;
  };

  public type ShowcaseSample = {
    file : Storage.ExternalBlob;
    description : Text;
  };

  public type NewShowcaseSamples = {
    samples : [?ShowcaseSample];
  };

  public type NewAllShowcaseSamples = {
    businessCard : NewShowcaseSamples;
    logoDesign : NewShowcaseSamples;
    productBanner : NewShowcaseSamples;
    photoFrame : NewShowcaseSamples;
  };

  public type NewActor = {
    showcaseSamples : NewAllShowcaseSamples;
  };

  public func run(old : OldActor) : NewActor {
    let convertSamples = func(samples : OldShowcaseSamples) : NewShowcaseSamples {
      let newSamples = Array.tabulate(
        12,
        func(i) {
          if (i == 0) { samples.sample1 } else if (i == 1) { samples.sample2 } else if (i == 2) {
            samples.sample3;
          } else if (i == 3) { samples.sample4 } else { null };
        },
      );
      { samples = newSamples };
    };

    {
      showcaseSamples = {
        businessCard = { samples = Array.tabulate(12, func(i) { null }) };
        logoDesign = { samples = Array.tabulate(12, func(i) { null }) };
        productBanner = convertSamples(old.bannerSamples);
        photoFrame = { samples = Array.tabulate(12, func(i) { null }) };
      };
    };
  };
};
